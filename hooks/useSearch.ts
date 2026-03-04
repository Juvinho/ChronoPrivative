'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface SearchFilters {
  query: string;
  tags: string[];
  moods: string[];
  weather: string[];
  dateFrom?: string;
  dateTo?: string;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
  weather?: string;
  tags?: string[];
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // M-03: limpa o timer pendente quando o componente desmonta,
  // evitando setState em componente desmontado
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const search = useCallback(
    async (filters: SearchFilters) => {
      setError(null);
      setIsLoading(true);

      try {
        const params = new URLSearchParams();

        if (filters.query) {
          params.append('q', filters.query);
        }

        if (filters.tags.length > 0) {
          params.append('tags', filters.tags.join(','));
        }

        if (filters.moods.length > 0) {
          params.append('moods', filters.moods.join(','));
        }

        if (filters.weather.length > 0) {
          params.append('weather', filters.weather.join(','));
        }

        if (filters.dateFrom) {
          params.append('dateFrom', filters.dateFrom);
        }

        if (filters.dateTo) {
          params.append('dateTo', filters.dateTo);
        }

        const response = await fetch(`/api/posts/search?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro na busca');
        }

        const data = await response.json();
        setResults(data.posts || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const debouncedSearch = useCallback(
    (filters: SearchFilters, delayMs = 300) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        search(filters);
      }, delayMs);
    },
    [search]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    debouncedSearch,
    clearResults,
  };
}
