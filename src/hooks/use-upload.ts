import { useMutation } from '@tanstack/react-query';
import { uploadService } from '@/services/upload';

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadService.uploadFile(file, folder),
  });
}
