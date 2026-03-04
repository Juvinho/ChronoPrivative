// ⚠️ CONVENTION: NÃO redeclarar PostEntry localmente em outros arquivos.
// Importar de @/hooks/use-posts (re-exporta Post de @/lib/types).
import { useState, useEffect } from 'react';
import { type Post, sanitizePost } from '@/lib/types';

// PostEntry estende o tipo autoritativo Post com campos de UI específicos do feed
export interface PostEntry extends Post {
  tag: string;         // tag principal para exibição no feed
  imageUrl?: string;   // alias de cover_image_url para compatibilidade UI
  imageText?: string;
  hasImage?: boolean;
  time?: string;
}

interface UsePostsReturn {
  posts: PostEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePosts(): UsePostsReturn {
  const [posts, setPosts] = useState<PostEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:4000/api/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Include JWT token if available
          ...(typeof window !== 'undefined' && localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();

      // Mapear posts da API: sanitizePost garante que nenhum campo seja undefined
      const transformedPosts: PostEntry[] = (data.posts || []).map((raw: Record<string, unknown>) => {
        const post = sanitizePost(raw);
        return {
          ...post,
          tag: post.tags.length > 0 ? post.tags[0].name : 'LIFE',
          imageUrl: post.cover_image_url ?? undefined,
          imageText: post.cover_image_url ? 'Image attached' : undefined,
          hasImage: !!post.cover_image_url,
        };
      });

      setPosts(transformedPosts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching posts:', err);
      // Return empty array on error instead of crashing
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const refresh = async () => {
    await fetchPosts();
  };

  return { posts, loading, error, refresh };
}
