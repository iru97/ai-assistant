/**
 * Journal Safe MVP - Image Compression Utilities
 * Compresses images before uploading to Supabase Storage
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { STORAGE_CONFIG, PhotoCompressionResult } from '~/types/storage';

/**
 * Get file size from URI
 */
async function getFileSize(uri: string): Promise<number> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists && 'size' in fileInfo) {
      return fileInfo.size;
    }
    return 0;
  } catch (error) {
    console.error('Failed to get file size:', error);
    return 0;
  }
}

/**
 * Get image dimensions from URI
 */
async function getImageDimensions(
  uri: string
): Promise<{ width: number; height: number } | null> {
  try {
    // We'll use ImageManipulator to get the image info
    // by manipulating with no changes
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    // Unfortunately expo-image-manipulator doesn't return dimensions directly
    // We'll need to calculate based on the result or use another method
    return null;
  } catch (error) {
    console.error('Failed to get image dimensions:', error);
    return null;
  }
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number
): { width: number; height: number } {
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalHeight / originalWidth;
  const newWidth = maxWidth;
  const newHeight = Math.round(newWidth * aspectRatio);

  return { width: newWidth, height: newHeight };
}

/**
 * Compress image to target size
 * @param uri - Local file URI
 * @param targetSize - Target file size in bytes (default: 2MB)
 * @param maxWidth - Maximum width in pixels (default: 1920px)
 * @returns Compressed image result
 */
export async function compressImage(
  uri: string,
  targetSize: number = STORAGE_CONFIG.MAX_COMPRESSED_SIZE,
  maxWidth: number = STORAGE_CONFIG.MAX_IMAGE_WIDTH
): Promise<PhotoCompressionResult> {
  try {
    console.log('Starting image compression for:', uri);

    // Get original file size
    const originalSize = await getFileSize(uri);
    console.log('Original file size:', originalSize, 'bytes');

    // If file is already small enough, just resize if needed
    if (originalSize <= targetSize) {
      console.log('File already small enough, just resizing...');
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        {
          compress: STORAGE_CONFIG.COMPRESSION_QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const finalSize = await getFileSize(result.uri);

      return {
        success: true,
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: finalSize,
      };
    }

    // Start with initial compression
    let compressionQuality = STORAGE_CONFIG.COMPRESSION_QUALITY;
    let result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      {
        compress: compressionQuality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    let currentSize = await getFileSize(result.uri);
    console.log('After initial compression:', currentSize, 'bytes');

    // If still too large, progressively reduce quality
    let attempts = 0;
    const maxAttempts = 5;

    while (currentSize > targetSize && attempts < maxAttempts) {
      attempts++;
      compressionQuality = Math.max(0.3, compressionQuality - 0.1);

      console.log(
        `Attempt ${attempts}: reducing quality to ${compressionQuality}`
      );

      result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        {
          compress: compressionQuality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      currentSize = await getFileSize(result.uri);
      console.log(`New size: ${currentSize} bytes`);

      if (currentSize <= targetSize) {
        break;
      }

      // If quality is too low, try reducing dimensions further
      if (compressionQuality <= 0.3) {
        maxWidth = Math.floor(maxWidth * 0.8);
        console.log(`Reducing width to ${maxWidth}px`);

        result = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: maxWidth } }],
          {
            compress: compressionQuality,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

        currentSize = await getFileSize(result.uri);
        console.log(`New size after dimension reduction: ${currentSize} bytes`);
      }
    }

    console.log(
      `Compression complete: ${originalSize} → ${currentSize} bytes (${Math.round((currentSize / originalSize) * 100)}%)`
    );

    return {
      success: true,
      uri: result.uri,
      width: result.width,
      height: result.height,
      size: currentSize,
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown compression error',
    };
  }
}

/**
 * Validate image file
 */
export async function validateImage(uri: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      return { valid: false, error: 'File does not exist' };
    }

    // Check file size
    if ('size' in fileInfo && fileInfo.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      const maxSizeMB = STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
      return {
        valid: false,
        error: `File too large. Maximum size is ${maxSizeMB}MB`,
      };
    }

    // Check file extension
    const extension = uri.split('.').pop()?.toLowerCase();
    if (
      !extension ||
      !STORAGE_CONFIG.ALLOWED_EXTENSIONS.includes(`.${extension}`)
    ) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${STORAGE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`,
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('Image validation failed:', error);
    return {
      valid: false,
      error:
        error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

/**
 * Get file extension from URI
 */
export function getFileExtension(uri: string): string {
  const extension = uri.split('.').pop()?.toLowerCase();
  return extension || 'jpg';
}

/**
 * Generate unique filename for storage
 */
export function generateStorageFilename(
  userId: string,
  entryId: string,
  extension: string
): string {
  const timestamp = Date.now();
  return `${userId}/${entryId}_${timestamp}.${extension}`;
}
