/**
 * Journal Safe MVP - Storage Types
 * Types for photo storage and upload operations
 */

/**
 * Storage bucket configuration
 */
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'journal-photos',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB before compression
  MAX_COMPRESSED_SIZE: 2 * 1024 * 1024, // 2MB after compression
  MAX_IMAGE_WIDTH: 1920,
  COMPRESSION_QUALITY: 0.8,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.heic'],
} as const;

/**
 * Upload status
 */
export enum UploadStatus {
  PENDING = 'pending',
  COMPRESSING = 'compressing',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Photo upload result
 */
export interface PhotoUploadResult {
  success: boolean;
  storagePath?: string; // Path in storage bucket
  publicUrl?: string; // Public URL to access the photo
  error?: string;
  compressed?: boolean;
  originalSize?: number;
  finalSize?: number;
}

/**
 * Photo compression result
 */
export interface PhotoCompressionResult {
  success: boolean;
  uri?: string;
  width?: number;
  height?: number;
  size?: number;
  error?: string;
}

/**
 * Upload progress callback
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Storage error types
 */
export enum StorageErrorType {
  FILE_TOO_LARGE = 'file_too_large',
  INVALID_FILE_TYPE = 'invalid_file_type',
  COMPRESSION_FAILED = 'compression_failed',
  UPLOAD_FAILED = 'upload_failed',
  NETWORK_ERROR = 'network_error',
  PERMISSION_DENIED = 'permission_denied',
  STORAGE_QUOTA_EXCEEDED = 'storage_quota_exceeded',
  UNKNOWN = 'unknown',
}

/**
 * Storage error
 */
export interface StorageError {
  type: StorageErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};
