/**
 * ChronoPrivative Application Types
 * Central type definitions for all components and hooks
 */

// ⚠️ CONVENTION: NÃO declarar type Post em nenhum outro arquivo.
// Importar exclusivamente de @/lib/types.
// Redeclarações locais serão rejeitadas em code review.

/** Tag retornada pela API */
export interface Tag {
  id: number;
  name: string;
  slug: string;
}

/** Metadata de Post (mood, weather, listening) */
export interface PostMetadata {
  mood?: string;
  weather?: string;
  listening?: string;
  [key: string]: unknown;
}

/**
 * Post — tipo autoritativo. Alinhado com a resposta da API.
 * Campos sem ? são obrigatórios; nunca undefined após sanitizePost().
 */
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;           // obrigatório — '' se ausente
  excerpt: string;           // obrigatório — '' se ausente
  cover_image_url: string | null;
  status: 'published' | 'draft' | 'archived';
  tags: Tag[];               // obrigatório — [] se ausente
  metadata: PostMetadata;    // obrigatório — {} se ausente
  views?: number;
  author?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Sanitiza um post vindo da API para garantir que nenhum campo
 * obrigatório seja undefined. Usar no mapeamento de respostas da API.
 *
 * @example
 * const posts = data.posts.map(sanitizePost);
 */
export function sanitizePost(raw: Record<string, unknown>): Post {
  const rawTags = raw.tags;
  const tags: Tag[] = Array.isArray(rawTags)
    ? rawTags.map((t) =>
        typeof t === 'string'
          ? { id: 0, name: t, slug: t.toLowerCase().replace(/\s+/g, '-') }
          : (t as Tag)
      )
    : [];

  return {
    id: typeof raw.id === 'number' ? raw.id : Number(raw.id ?? 0),
    title: (raw.title as string) ?? '',
    slug: (raw.slug as string) ?? '',
    content: (raw.content as string) ?? '',
    excerpt: (raw.excerpt as string) ?? '',
    cover_image_url: (raw.cover_image_url as string | null) ?? null,
    status: (['published', 'draft', 'archived'].includes(raw.status as string)
      ? raw.status
      : 'draft') as Post['status'],
    tags,
    // T-001: metadata pode vir como string JSON do PostgreSQL JSONB — desserializar
    metadata: (() => {
      const m = raw.metadata;
      if (!m) return {} as PostMetadata;
      if (typeof m === 'string') {
        try { return JSON.parse(m) as PostMetadata; } catch { return {} as PostMetadata; }
      }
      return m as PostMetadata;
    })(),
    views: typeof raw.views === 'number' ? raw.views : undefined,
    author: (raw.author as string) ?? undefined,
    created_at: (raw.created_at as string) ?? '',
    updated_at: (raw.updated_at as string) ?? undefined,
  };
}

/** Image Interface */
export interface Image {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
}

/** Form Data for Post Creation/Editing */
export interface PostFormData {
  title: string;
  content: string;
  mood?: string;
  weather?: string;
  music?: string;
  tags: string[];
}

/** API Response Types */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

/** Search Filter Interface */
export interface SearchFilters {
  query?: string;
  tags?: string[];
  moods?: string[];
  weather?: string[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/** Mood Statistics */
export interface MoodStat {
  mood: string;
  count: number;
  percentage: number;
  posts: Post[];
}

/** Analytics Data */
export interface Analytics {
  totalPosts: number;
  totalWords: number;
  avgWordsPerPost: number;
  moods: MoodStat[];
  topTags: Array<{ tag: string; count: number }>;
  postsByMonth: Array<{ month: string; count: number }>;
}

/** User Session/Auth */
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

/** Keyboard Shortcut Handler Map */
export interface KeyboardShortcuts {
  onNewPost?: () => void;
  onEditPost?: () => void;
  onDeletePost?: () => void;
  onSearch?: () => void;
  onPreviousPost?: () => void;
  onNextPost?: () => void;
  onRandomPost?: () => void;
  onToggleDarkMode?: () => void;
  onShowHelp?: () => void;
  onFavorite?: () => void;
  onAddTag?: () => void;
  onGoHome?: () => void;
  onGoEnd?: () => void;
}

/** Component Props Interfaces */

export interface EditPostModalProps {
  isOpen: boolean;
  post?: Post;
  onClose: () => void;
  onSave: (data: PostFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface ImageGalleryProps {
  images: Image[];
  onUpload: (file: File) => Promise<string>;
  onDelete: (imageId: string) => Promise<void>;
  onReorder: (images: Image[]) => void;
  maxImages?: number;
}

export interface SearchPanelProps {
  onSearch: (filters: SearchFilters) => Promise<void>;
  availableTags: string[];
  availableMoods: string[];
  availableWeather: string[];
  isLoading?: boolean;
}

export interface TimelineViewProps {
  posts: Post[];
  onLoadMore: () => Promise<void>;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onPostSelect: (post: Post) => void;
}

export interface MiniCalendarProps {
  posts: Post[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export interface SerendipityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFetch: () => Promise<Post | null>;
  onSelect: (post: Post) => void;
  isLoading?: boolean;
}

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface MoodHeatmapProps {
  posts: Post[];
}

export interface DarkModeToggleProps {
  onToggle?: (isDark: boolean) => void;
}

/** API Request/Response Models */

export interface CreatePostRequest {
  title: string;
  content: string;
  mood?: string;
  weather?: string;
  music?: string;
  tags?: string[];
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string;
}

export interface SearchPostsRequest extends SearchFilters {
  q?: string;
}

export interface SearchPostsResponse {
  posts: Post[];
  total: number;
  query?: string;
}

/** Error Response */
export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: Record<string, any>;
}

/** Constants */
export const MOODS = ['happy', 'sad', 'angry', 'calm', 'excited', 'nostalgic'] as const;
export const WEATHER = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'] as const;
export const MAX_TITLE_LENGTH = 255;
export const MAX_CONTENT_LENGTH = 10000;
export const MAX_TAG_LENGTH = 50;
export const MAX_IMAGES_PER_POST = 5;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/** Colors (Cyberpunk Theme) */
export const THEME_COLORS = {
  primary: '#9400FF',    // Cyber purple
  accent: '#00FF00',     // Cyber green
  dark: '#0A0015',       // Deep black
  secondary: '#1A0B2E',  // Secondary black
  error: '#FF4500',      // Orange red
  success: '#32CD32',    // Lime green
} as const;
