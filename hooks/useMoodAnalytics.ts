'use client';

import { useState, useCallback } from 'react';

interface MoodAnalytics {
  mood: string;
  count: number;
  percentage: number;
  posts: Array<{
    id: string;
    title: string;
    date: string;
  }>;
}

export function useMoodAnalytics() {
  const [analytics, setAnalytics] = useState<MoodAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoodAnalytics = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/posts/analytics/mood');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar análise de humor');
      }

      const data = await response.json();
      setAnalytics(data.analytics || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    analytics,
    isLoading,
    error,
    fetchMoodAnalytics,
  };
}
