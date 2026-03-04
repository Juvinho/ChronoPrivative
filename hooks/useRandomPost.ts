'use client';

import { useState, useCallback } from 'react';

interface RandomPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
  weather?: string;
  tags?: string[];
}

export function useRandomPost() {
  const [post, setPost] = useState<RandomPost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomPost = useCallback(async (): Promise<RandomPost | null> => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/posts/random');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nenhum post encontrado');
      }

      const data = await response.json();
      setPost(data.post || null);
      return data.post || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPost(null);
    setError(null);
  }, []);

  return {
    post,
    isLoading,
    error,
    fetchRandomPost,
    reset,
  };
}
