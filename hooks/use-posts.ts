import { useState, useEffect } from 'react';

interface PostMetadata {
  mood?: string;
  weather?: string;
  listening?: string;
}

export interface PostEntry {
  id: number;
  title: string;
  content: string;
  tag: string;
  created_at: string;
  updated_at?: string;
  user_id?: number;
  slug?: string;
  views_count?: number;
  reactions_count?: number;
  comments_count?: number;
  metadata?: PostMetadata;
  imageUrl?: string;
  imageText?: string;
  image_url?: string;
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
      
      // Transform API response to match Post interface
      const transformedPosts = (data.posts || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        tag: post.tag || 'LIFE',
        created_at: post.created_at,
        updated_at: post.updated_at,
        user_id: post.user_id,
        slug: post.slug,
        views_count: post.views_count || 0,
        reactions_count: post.reactions_count || 0,
        comments_count: post.comments_count || 0,
        metadata: post.metadata || {},
        imageUrl: post.image_url,
        imageText: post.image_url ? 'Image attached' : undefined,
        // Fallback for old structure
        image_url: post.image_url
      }));

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
