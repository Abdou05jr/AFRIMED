import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface UploadProgress {
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
  speed: number; // bytes per second
  estimatedTime: number; // seconds
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  uri: string;
}

export interface StorageQuota {
  used: number;
  available: number;
  total: number;
  percentage: number;
}

class StorageService {
  private readonly SCAN_BUCKET = 'medical-scans';
  private readonly DOCUMENT_BUCKET = 'documents';
  private readonly AVATAR_BUCKET = 'avatars';
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  private readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  
  private uploadProgressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map();

  async uploadScanImage(
    userId: string, 
    scanType: string, 
    imageUri: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    console.log(`📤 Uploading ${scanType} scan for user ${userId}`);
    
    try {
      // Validate file before upload
      const fileInfo = await this.validateFile(imageUri, this.ALLOWED_IMAGE_TYPES);
      
      const fileExt = this.getFileExtension(imageUri);
      const fileName = `${userId}/${scanType}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const uploadId = `scan_${userId}_${Date.now()}`;
      if (onProgress) {
        this.uploadProgressCallbacks.set(uploadId, onProgress);
      }

      const startTime = Date.now();
      let lastProgressTime = startTime;
      let lastBytesUploaded = 0;

      const { data, error } = await supabase.storage
        .from(this.SCAN_BUCKET)
        .upload(fileName, await this.fileToBlob(imageUri), {
          contentType: `image/${fileExt}`,
          upsert: false,
          cacheControl: '3600',
          onUploadProgress: (progress) => {
            const currentTime = Date.now();
            const timeDiff = (currentTime - lastProgressTime) / 1000;
            const bytesDiff = progress.loaded - lastBytesUploaded;
            const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;
            const estimatedTime = speed > 0 ? (progress.total - progress.loaded) / speed : 0;

            const uploadProgress: UploadProgress = {
              bytesUploaded: progress.loaded,
              totalBytes: progress.total,
              percentage: (progress.loaded / progress.total) * 100,
              speed,
              estimatedTime,
            };

            onProgress?.(uploadProgress);
            lastProgressTime = currentTime;
            lastBytesUploaded = progress.loaded;
          },
        });

      this.uploadProgressCallbacks.delete(uploadId);

      if (error) {
        console.error('❌ Scan upload failed:', error);
        throw new Error(`Failed to upload scan: ${error.message}`);
      }

      const uploadTime = Date.now() - startTime;
      console.log(`✅ Scan uploaded in ${uploadTime}ms: ${data.path}`);

      const { data: urlData } = supabase.storage
        .from(this.SCAN_BUCKET)
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
        size: fileInfo.size,
        contentType: `image/${fileExt}`,
        uploadedAt: new Date(),
        metadata: {
          scanType,
          uploadTime,
          userId,
          originalName: this.getFileNameFromUri(imageUri),
        },
      };

    } catch (error) {
      console.error('❌ Scan upload error:', error);
      throw new Error(`Scan upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadDocument(
    userId: string, 
    documentType: string, 
    fileUri: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    console.log(`📄 Uploading ${documentType} document for user ${userId}`);
    
    try {
      // Validate document before upload
      const fileInfo = await this.validateFile(fileUri, this.ALLOWED_DOCUMENT_TYPES);
      
      const fileExt = this.getFileExtension(fileUri);
      const fileName = `${userId}/${documentType}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const uploadId = `doc_${userId}_${Date.now()}`;
      if (onProgress) {
        this.uploadProgressCallbacks.set(uploadId, onProgress);
      }

      const { data, error } = await supabase.storage
        .from(this.DOCUMENT_BUCKET)
        .upload(fileName, await this.fileToBlob(fileUri), {
          contentType: this.getContentType(fileExt),
          upsert: false,
          cacheControl: '86400',
          onUploadProgress: (progress) => {
            const uploadProgress: UploadProgress = {
              bytesUploaded: progress.loaded,
              totalBytes: progress.total,
              percentage: (progress.loaded / progress.total) * 100,
              speed: 0, // Would need timing calculation
              estimatedTime: 0,
            };
            onProgress?.(uploadProgress);
          },
        });

      this.uploadProgressCallbacks.delete(uploadId);

      if (error) {
        console.error('❌ Document upload failed:', error);
        throw new Error(`Failed to upload document: ${error.message}`);
      }

      console.log(`✅ Document uploaded: ${data.path}`);

      const { data: urlData } = supabase.storage
        .from(this.DOCUMENT_BUCKET)
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
        size: fileInfo.size,
        contentType: this.getContentType(fileExt),
        uploadedAt: new Date(),
        metadata: {
          documentType,
          userId,
          originalName: this.getFileNameFromUri(fileUri),
        },
      };

    } catch (error) {
      console.error('❌ Document upload error:', error);
      throw new Error(`Document upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadAvatar(userId: string, imageUri: string): Promise<UploadResult> {
    console.log(`🖼️ Uploading avatar for user ${userId}`);
    
    try {
      const fileInfo = await this.validateFile(imageUri, this.ALLOWED_IMAGE_TYPES);
      
      // Resize image for avatar (simplified - in production, use proper image processing)
      const processedUri = await this.processImageForAvatar(imageUri);
      
      const fileExt = this.getFileExtension(imageUri);
      const fileName = `${userId}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(this.AVATAR_BUCKET)
        .upload(fileName, await this.fileToBlob(processedUri), {
          contentType: `image/${fileExt}`,
          upsert: true, // Overwrite existing avatar
          cacheControl: '3600',
        });

      if (error) {
        console.error('❌ Avatar upload failed:', error);
        throw new Error(`Failed to upload avatar: ${error.message}`);
      }

      console.log(`✅ Avatar uploaded: ${data.path}`);

      const { data: urlData } = supabase.storage
        .from(this.AVATAR_BUCKET)
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
        size: fileInfo.size,
        contentType: `image/${fileExt}`,
        uploadedAt: new Date(),
      };

    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      throw new Error(`Avatar upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
      }

      console.log(`✅ File deleted: ${path}`);
    } catch (error) {
      console.error('❌ File deletion error:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStorageQuota(userId: string): Promise<StorageQuota> {
    try {
      // Note: Supabase doesn't provide per-user storage quotas out of the box
      // This would need to be implemented based on your billing plan
      // For now, return mock data
      return {
        used: 0, // Would calculate from user's files
        available: 100 * 1024 * 1024, // 100MB
        total: 100 * 1024 * 1024,
        percentage: 0,
      };
    } catch (error) {
      console.error('❌ Storage quota query error:', error);
      throw new Error('Failed to get storage quota');
    }
  }

  async listUserFiles(userId: string, bucket: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(userId);

      if (error) {
        throw new Error(`Failed to list files: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ File listing error:', error);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateFile(fileUri: string, allowedTypes: string[]): Promise<FileInfo> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      if (!fileInfo.size || fileInfo.size > this.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      // Basic file type validation
      const fileExt = this.getFileExtension(fileUri);
      const contentType = this.getContentType(fileExt);
      
      if (!allowedTypes.includes(contentType)) {
        throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }

      return {
        name: this.getFileNameFromUri(fileUri),
        size: fileInfo.size || 0,
        type: contentType,
        lastModified: new Date(fileInfo.modificationTime || Date.now()),
        uri: fileUri,
      };

    } catch (error) {
      console.error('❌ File validation failed:', error);
      throw new Error(`File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fileToBlob(fileUri: string): Promise<Blob> {
    if (Platform.OS === 'web') {
      // Web implementation
      const response = await fetch(fileUri);
      return await response.blob();
    } else {
      // React Native implementation
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = this.base64ToUint8Array(base64);
      return new Blob([bytes], { type: this.getContentType(this.getFileExtension(fileUri)) });
    }
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private getFileExtension(uri: string): string {
    return uri.split('.').pop()?.toLowerCase() || 'jpg';
  }

  private getFileNameFromUri(uri: string): string {
    return uri.split('/').pop() || 'file';
  }

  private getContentType(ext: string | undefined): string {
    const typeMap: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return typeMap[ext || ''] || 'application/octet-stream';
  }

  private async processImageForAvatar(imageUri: string): Promise<string> {
    // Simplified image processing - in production, use a proper image processing library
    // For now, just return the original URI
    return imageUri;
    
    // Example with proper image processing:
    // const processedUri = await ImageManipulator.manipulateAsync(
    //   imageUri,
    //   [{ resize: { width: 200, height: 200 } }],
    //   { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    // );
    // return processedUri.uri;
  }

  // Utility to cancel ongoing uploads
  cancelUpload(uploadId: string): void {
    this.uploadProgressCallbacks.delete(uploadId);
    // Note: Supabase SDK doesn't support upload cancellation directly
    // This would need to be handled at the application level
  }

  // Cleanup method
  cleanup(): void {
    this.uploadProgressCallbacks.clear();
  }
}

// Create and export singleton instance
export const storageService = new StorageService();

// Utility functions for storage operations
export const StorageUtils = {
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileIcon: (fileType: string): string => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.startsWith('text/')) return '📝';
    return '📎';
  },

  isImageFile: (fileType: string): boolean => {
    return fileType.startsWith('image/');
  },

  generateFileName: (prefix: string, extension: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}.${extension}`;
  },
};