import api from '@/lib/api/client';

interface UploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
  folder?: string;
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

export async function uploadFile({ file, onProgress, folder = 'uploads' }: UploadOptions): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
    timeout: 120000,
  });

  return response.data.data;
}

export function validateFile(file: File, options?: {
  maxSize?: number;
  acceptedTypes?: string[];
}): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, acceptedTypes } = options || {};

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`,
    };
  }

  if (acceptedTypes && acceptedTypes.length > 0) {
    const isAccepted = acceptedTypes.some((type) => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return {
        valid: false,
        error: `File type not accepted. Allowed: ${acceptedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true };
}
