/**
 * Journal Safe MVP - Storage Helper Functions
 * Utilities for interacting with Supabase Storage
 */

import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from '~/utils/supabase';
import {
  STORAGE_CONFIG,
  PhotoUploadResult,
  StorageError,
  StorageErrorType,
  RetryConfig,
  DEFAULT_RETRY_CONFIG,
} from '~/types/storage';
import {
  compressImage,
  validateImage,
  getFileExtension,
  generateStorageFilename,
} from '~/utils/imageCompression';

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay =
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Create storage error from exception
 */
function createStorageError(
  error: unknown,
  defaultType: StorageErrorType = StorageErrorType.UNKNOWN
): StorageError {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const message = errorObj.message.toLowerCase();

  let type = defaultType;
  let retryable = false;

  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('connection')
  ) {
    type = StorageErrorType.NETWORK_ERROR;
    retryable = true;
  } else if (message.includes('permission') || message.includes('unauthorized')) {
    type = StorageErrorType.PERMISSION_DENIED;
    retryable = false;
  } else if (message.includes('quota') || message.includes('storage full')) {
    type = StorageErrorType.STORAGE_QUOTA_EXCEEDED;
    retryable = false;
  } else if (message.includes('too large') || message.includes('size')) {
    type = StorageErrorType.FILE_TOO_LARGE;
    retryable = false;
  }

  return {
    type,
    message: errorObj.message,
    originalError: errorObj,
    retryable,
  };
}

/**
 * Upload photo to Supabase Storage with retry logic
 * @param uri - Local file URI
 * @param entryId - Journal entry ID
 * @param userId - User ID
 * @param config - Retry configuration
 * @returns Upload result with storage path and public URL
 */
export async function uploadPhotoWithRetry(
  uri: string,
  entryId: string,
  userId: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<PhotoUploadResult> {
  let lastError: StorageError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = calculateRetryDelay(attempt - 1, config);
        console.log(
          `Retry attempt ${attempt}/${config.maxRetries} after ${delay}ms delay...`
        );
        await sleep(delay);
      }

      const result = await uploadPhoto(uri, entryId, userId);

      if (result.success) {
        console.log('Photo upload successful:', result.storagePath);
        return result;
      }

      // If upload failed but not retryable, return immediately
      lastError = createStorageError(
        new Error(result.error || 'Upload failed'),
        StorageErrorType.UPLOAD_FAILED
      );

      if (!lastError.retryable) {
        console.log('Non-retryable error, aborting:', lastError.message);
        return result;
      }
    } catch (error) {
      lastError = createStorageError(error, StorageErrorType.UPLOAD_FAILED);
      console.error(`Upload attempt ${attempt + 1} failed:`, lastError.message);

      if (!lastError.retryable) {
        console.log('Non-retryable error, aborting:', lastError.message);
        break;
      }
    }
  }

  return {
    success: false,
    error:
      lastError?.message ||
      `Upload failed after ${config.maxRetries} retries`,
  };
}

/**
 * Upload photo to Supabase Storage (single attempt)
 * @param uri - Local file URI
 * @param entryId - Journal entry ID
 * @param userId - User ID
 * @returns Upload result with storage path and public URL
 */
export async function uploadPhoto(
  uri: string,
  entryId: string,
  userId: string
): Promise<PhotoUploadResult> {
  try {
    console.log('Starting photo upload:', { uri, entryId, userId });

    // Validate image
    const validation = await validateImage(uri);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Compress image
    console.log('Compressing image...');
    const compressionResult = await compressImage(uri);

    if (!compressionResult.success || !compressionResult.uri) {
      return {
        success: false,
        error: compressionResult.error || 'Image compression failed',
      };
    }

    // Generate filename
    const extension = getFileExtension(uri);
    const storagePath = generateStorageFilename(userId, entryId, extension);

    console.log('Uploading to storage path:', storagePath);

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(compressionResult.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(storagePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    console.log('Upload successful:', data.path);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      success: true,
      storagePath: data.path,
      publicUrl,
      compressed: true,
      originalSize: compressionResult.size,
      finalSize: compressionResult.size,
    };
  } catch (error) {
    console.error('Photo upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}

/**
 * Get public URL for a photo from storage path
 * @param storagePath - Path in storage bucket
 * @returns Public URL
 */
export function getPhotoUrl(storagePath: string): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_CONFIG.BUCKET_NAME).getPublicUrl(storagePath);

  return publicUrl;
}

/**
 * Delete photo from storage
 * @param storagePath - Path in storage bucket
 * @returns Success boolean
 */
export async function deletePhoto(storagePath: string): Promise<boolean> {
  try {
    console.log('Deleting photo:', storagePath);

    const { error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      console.error('Delete photo error:', error);
      return false;
    }

    console.log('Photo deleted successfully:', storagePath);
    return true;
  } catch (error) {
    console.error('Failed to delete photo:', error);
    return false;
  }
}

/**
 * Download photo from storage to local cache
 * @param publicUrl - Public URL of the photo
 * @returns Local file URI or null
 */
export async function downloadPhoto(publicUrl: string): Promise<string | null> {
  try {
    console.log('Downloading photo:', publicUrl);

    const filename = publicUrl.split('/').pop() || 'photo.jpg';
    const localUri = `${FileSystem.cacheDirectory}${filename}`;

    const { uri } = await FileSystem.downloadAsync(publicUrl, localUri);

    console.log('Photo downloaded to:', uri);
    return uri;
  } catch (error) {
    console.error('Failed to download photo:', error);
    return null;
  }
}

/**
 * Check if storage bucket is accessible
 * @returns Success boolean
 */
export async function checkStorageAccess(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Storage access check failed:', error);
      return false;
    }

    const bucketExists = data.some(
      (bucket) => bucket.name === STORAGE_CONFIG.BUCKET_NAME
    );

    if (!bucketExists) {
      console.error(
        `Storage bucket '${STORAGE_CONFIG.BUCKET_NAME}' not found`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Storage access check failed:', error);
    return false;
  }
}

/**
 * Get storage usage for current user
 * @param userId - User ID
 * @returns Total size in bytes or null
 */
export async function getUserStorageUsage(
  userId: string
): Promise<number | null> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .list(userId);

    if (error) {
      console.error('Failed to get storage usage:', error);
      return null;
    }

    const totalSize = data.reduce((sum, file) => {
      return sum + (file.metadata?.size || 0);
    }, 0);

    return totalSize;
  } catch (error) {
    console.error('Failed to calculate storage usage:', error);
    return null;
  }
}
