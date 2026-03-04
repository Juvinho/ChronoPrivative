'use client';

import { useState, useCallback, useRef } from 'react';

interface TimelinePost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
  weather?: string;
  tags?: string[];
}

interface UseTimelineOptions {
  postsPerPage?: number;
}

export function useTimeline(options: UseTimelineOptions = {}) {
  const { postsPerPage = 10 } = options;

  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const loadPosts = useCallback(async (reset = false) => {
    setError(null);
    setIsLoadingMore(true);

    try {
      const page = reset ? 1 : pageRef.current;
      const limit = postsPerPage;

      const response = await fetch(
        `/api/posts?page=${page}&limit=${limit}&sort=createdAt&order=desc`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar posts');
      }

      const data = await response.json();

      if (reset) {
        setPosts(data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }

      pageRef.current = page + 1;
      setHasMore((data.posts || []).length === limit);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [postsPerPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    await loadPosts(false);
  }, [loadPosts, isLoadingMore, hasMore]);

  const refresh = useCallback(async () => {
    pageRef.current = 1;
    await loadPosts(true);
  }, [loadPosts]);

  return {
    posts,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
