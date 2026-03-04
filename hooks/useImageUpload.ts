'use client';

import { useState, useCallback } from 'react';

interface UploadProgress {
  [filename: string]: number;
}

export function useImageUpload(postId: string) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      setError(null);

      try {
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error('Arquivo não é uma imagem válida');
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Arquivo maior que 5MB');
        }

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);

        // Upload with progress tracking
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        const response = await fetch(`/api/posts/${postId}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro no upload');
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        const data = await response.json();
        return data.filename || data.url;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido no upload';
        setError(message);
        throw err;
      }
    },
    [postId]
  );

  const deleteImage = useCallback(async (imageId: string): Promise<void> => {
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postId}/images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar imagem');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido ao deletar';
      setError(message);
      throw err;
    }
  }, [postId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadImage,
    deleteImage,
    uploadProgress,
    error,
    clearError,
  };
}
