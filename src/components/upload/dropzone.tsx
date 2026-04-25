'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFile, validateFile, UploadResult } from '@/lib/api/upload';
import { toast } from 'sonner';

interface DropzoneProps {
  onUploadComplete?: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  accept?: string[];
  maxSize?: number;
  maxFiles?: number;
  folder?: string;
  className?: string;
}

export function Dropzone({
  onUploadComplete,
  onUploadError,
  accept = ['image/*', 'application/pdf'],
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
  folder = 'uploads',
  className,
}: DropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState<Set<string>>(new Set());
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(selectedFiles);
  }, []);

  const handleFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: File[] = [];

    newFiles.forEach((file) => {
      const validation = validateFile(file, { maxSize, acceptedTypes: accept });
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        onUploadError?.(validation.error || 'Invalid file');
        return;
      }
      validFiles.push(file);
    });

    setFiles((prev) => [...prev, ...validFiles]);

    // Auto-upload valid files
    validFiles.forEach((file) => {
      uploadSingleFile(file);
    });
  };

  const uploadSingleFile = async (file: File) => {
    setUploading((prev) => new Set(prev).add(file.name));

    try {
      const result = await uploadFile({
        file,
        folder,
        onProgress: (progress) => {
          setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
        },
      });

      toast.success(`${file.name} uploaded successfully`);
      onUploadComplete?.(result);
      
      // Remove from list after successful upload
      setFiles((prev) => prev.filter((f) => f.name !== file.name));
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Upload failed';
      toast.error(`${file.name}: ${message}`);
      onUploadError?.(message);
    } finally {
      setUploading((prev) => {
        const next = new Set(prev);
        next.delete(file.name);
        return next;
      });
    }
  };

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setUploadProgress((prev) => {
      const next = { ...prev };
      delete next[fileName];
      return next;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <input
          type="file"
          multiple
          accept={accept.join(',')}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <motion.div
            animate={isDragActive ? { y: [0, -5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          </motion.div>
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse (max {maxFiles} files, {(maxSize / 1024 / 1024).toFixed(0)}MB each)
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supported: {accept.join(', ')}
          </p>
        </label>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-5 w-5 text-blue-500 shrink-0" />
                ) : (
                  <FileText className="h-5 w-5 text-orange-500 shrink-0" />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  
                  {uploading.has(file.name) && (
                    <div className="mt-2">
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <motion.div
                          className="bg-primary h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress[file.name] || 0}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {uploadProgress[file.name] || 0}%
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => removeFile(file.name)}
                  className="p-1 hover:bg-accent rounded-md transition-colors"
                  disabled={uploading.has(file.name)}
                >
                  {uploading.has(file.name) ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
