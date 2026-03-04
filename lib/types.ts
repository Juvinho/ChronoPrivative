/**
 * ChronoPrivative Application Types
 * Central type definitions for all components and hooks
 */

/** Post Interface - Core data model */
export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  mood?: 'happy' | 'sad' | 'angry' | 'calm' | 'excited' | 'nostalgic';
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  tags?: string[];
  images?: Image[];
  isFavorite?: boolean;
  imageUrl?: string;
  imageText?: string;
  hasImage?: boolean;
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
