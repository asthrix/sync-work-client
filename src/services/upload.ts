import api from '@/lib/api/client';
import { ApiResponse } from '@/types';

export const uploadService = {
  uploadFile: async (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    const response = await api.post<ApiResponse<{ url: string; filename: string }>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFileUrl: (folder: string, filename: string) => {
    return `/api/backend/files/${folder}/${filename}`;
  },
};
