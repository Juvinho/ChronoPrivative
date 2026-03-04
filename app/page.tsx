"use client";

import { Terminal, Lock, Clock, User, ChevronRight, Plus, ArrowLeft, Eye, Edit3, Send, Trash2, AlertTriangle, Save, RefreshCw, RotateCcw, Search, Image as ImageIcon, X, Bold, Italic, Link as LinkIcon, List, Quote, Code, HelpCircle, Loader } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { TypewriterText } from "@/components/typewriter-text";
import { LoginScreen } from "@/components/login-screen";
import { RetroImagePlaceholder } from "@/components/retro-image-placeholder";

import { TerminalInput } from "@/components/terminal-input";
import { TerminalTextarea } from "@/components/terminal-textarea";

import { HighlightText } from "@/components/highlight-text";
import { usePosts, type PostEntry as Post } from "@/hooks/use-posts";
import AboutWidget from "@/components/AboutWidget";
import TopicsWidget from "@/components/TopicsWidget";
import ArchivesWidget from "@/components/ArchivesWidget";
import EditPostModal from "@/components/EditPostModal";

export default function Home() {
  // Helper function to format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsAgo < 60) return 'just now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minutes ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hours ago`;
    if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)} days ago`;
    if (secondsAgo < 2592000) return `${Math.floor(secondsAgo / 604800)} weeks ago`;
    return `${Math.floor(secondsAgo / 2592000)} months ago`;
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userBio, setUserBio] = useState<string>("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTag, setPostTag] = useState("LIFE");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postImageText, setPostImageText] = useState<string>("");
  const [postMood, setPostMood] = useState("Neutral");
  const [postWeather, setPostWeather] = useState("Clear");
  const [postListening, setPostListening] = useState("Silence");

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  // Refs for auto-save to avoid effect re-runs on every keystroke
  const draftRefs = useRef({
    postTitle,
    postContent,
    postTag,
    postMood,
    postWeather,
    postListening,
    postImage,
    postImageText
  });

  useEffect(() => {
    draftRefs.current = {
      postTitle,
      postContent,
      postTag,
      postMood,
      postWeather,
      postListening,
      postImage,
      postImageText
    };
  }, [postTitle, postContent, postTag, postMood, postWeather, postListening, postImage, postImageText]);

  const insertMarkdown = (before: string, after: string = "") => {
    if (!contentRef.current) return;
    
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setPostContent(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      if (selectedText.length > 0) {
        const newCursorPos = start + before.length + selectedText.length + after.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      } else {
        const newCursorPos = start + before.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (5MB limit as mentioned in UI)
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Max 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result as string);
        setPostImageText(file.name.toUpperCase());
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const removeImage = () => {
    setPostImage(null);
    setPostImageText("");
  };

  const handleCreatePost = () => {
    setIsCreatingPost(true);
    const savedDraft = localStorage.getItem('chrono_draft');
    if (savedDraft) {
      setHasDraft(true);
    }
  };

  useEffect(() => {
    if (!isCreatingPost || isPreviewMode) return;

    const timer = setInterval(() => {
      const { postTitle, postContent, postImage, postTag, postMood, postWeather, postListening, postImageText } = draftRefs.current;
      
      if (postTitle || postContent || postImage) {
        const draft = { 
          title: postTitle, 
          content: postContent, 
          tag: postTag,
          mood: postMood,
          weather: postWeather,
          listening: postListening,
          image: postImage,
          imageText: postImageText,
          timestamp: new Date().toISOString() 
        };
        localStorage.setItem('chrono_draft', JSON.stringify(draft));
        setLastSaved(new Date());
        setHasDraft(true);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(timer);
  }, [isCreatingPost, isPreviewMode]);

  const restoreDraft = () => {
    const savedDraft = localStorage.getItem('chrono_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setPostTitle(parsed.title || "");
        setPostContent(parsed.content || "");
        setPostTag(parsed.tag || "LIFE");
        setPostMood(parsed.mood || "Neutral");
        setPostWeather(parsed.weather || "Clear");
        setPostListening(parsed.listening || "Silence");
        setPostImage(parsed.image || null);
        setPostImageText(parsed.imageText || "");
        
        if (parsed.timestamp) {
          setLastSaved(new Date(parsed.timestamp));
        }
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  };


  // Fetch posts from backend
  const { posts: backendPosts, loading, error, refresh } = usePosts();

  // Re-read token after login completes — the JWT fetch in LoginScreen is async
  // and may finish after onUnlock fires. This effect retries until the token arrives.
  useEffect(() => {
    if (!isAuthenticated) return;
    const t = localStorage.getItem('auth_token');
    if (t) { setAuthToken(t); return; }
    // Token not stored yet — poll for up to 5s (10 × 500ms)
    let attempts = 0;
    const interval = setInterval(() => {
      const stored = localStorage.getItem('auth_token');
      if (stored || ++attempts >= 10) {
        if (stored) setAuthToken(stored);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const [posts, setPosts] = useState<Post[]>([]);

  // Sync backend posts with local state
  useEffect(() => {
    if (backendPosts.length > 0) {
      const transformedPosts: Post[] = backendPosts.map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content || '',
        excerpt: post.excerpt || '',
        tag: post.tags?.[0] || post.tag || 'LIFE',
        created_at: post.created_at,
        time: formatTimeAgo(post.created_at),
        metadata: post.metadata || {},
        status: post.status,
        hasImage: !!(post.cover_image_url || post.imageUrl || post.image_url),
        imageUrl: post.cover_image_url || post.imageUrl || post.image_url || null,
        imageText: (post.cover_image_url || post.imageUrl || post.image_url) ? 'Image' : undefined,
      }));
      setPosts(transformedPosts);
    }
  }, [backendPosts]);

  const [deletedPost, setDeletedPost] = useState<{ post: any, index: number } | null>(null);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);
  const [expandedMetadata, setExpandedMetadata] = useState<Record<number, boolean>>({});
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string, title: string } | null>(null);

  const filteredPosts = posts.filter(post => {
    const matchesTag = selectedTag ? post.tag === selectedTag : true;
    
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const keywords = searchQuery.toLowerCase().split(/\s+/).filter(k => k.length > 0);
      matchesSearch = keywords.every(keyword => 
        post.title.toLowerCase().includes(keyword) || 
        post.content.toLowerCase().includes(keyword) ||
        post.tag.toLowerCase().includes(keyword)
      );
    }
    
    return matchesTag && matchesSearch;
  });

  const toggleMetadata = (id: number) => {
    setExpandedMetadata(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlePublish = useCallback(async () => {
    try {
      const newPost = {
        title: postTitle || "Untitled Entry",
        content: postContent || "No content provided.",
        status: 'published',
        tags: [postTag],
        cover_image_url: postImage || undefined,
        metadata: {
          mood: postMood,
          weather: postWeather,
          listening: postListening
        },
      };

      // Send to backend
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('http://localhost:4000/api/posts/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(newPost)
      });

      if (!response.ok) {
        throw new Error('Failed to publish post');
      }

      const result = await response.json();
      
      // Refresh posts from backend
      await refresh();
      
      // Reset form
      setIsCreatingPost(false);
      setPostTitle("");
      setPostContent("");
      setPostImage(null);
      setPostImageText("");
      setPostMood("Neutral");
      setPostWeather("Clear");
      setPostListening("Silence");
      localStorage.removeItem('chrono_draft');
      setHasDraft(false);
      setLastSaved(null);
    } catch (err) {
      console.error('Error publishing post:', err);
      alert('Failed to publish post. Please try again.');
    }
  }, [postTitle, postContent, postTag, postImage, postImageText, postMood, postWeather, postListening]);

  const handleDelete = async (post: Post) => {
    const indexInOriginal = posts.findIndex(p => p.id === post.id);
    if (indexInOriginal === -1) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      // Delete from backend
      const response = await fetch(`http://localhost:4000/api/posts/admin/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.status} ${response.statusText}`);
      }

      // Update local state
      const newPosts = [...posts];
      newPosts.splice(indexInOriginal, 1);
      setPosts(newPosts);
      
      setDeletedPost({ post, index: indexInOriginal });
      
      if (undoTimer) clearTimeout(undoTimer);
      
      const timer = setTimeout(() => {
        setDeletedPost(null);
      }, 5000);
      setUndoTimer(timer);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleUndo = async () => {
    if (deletedPost) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        
        // Re-create the post in backend
        const response = await fetch('http://localhost:4000/api/posts/admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            title: deletedPost.post.title,
            content: deletedPost.post.content,
            status: 'published',
            tags: [deletedPost.post.tag],
            metadata: deletedPost.post.metadata
          })
        });

        if (response.ok) {
          const restored = await response.json(); // { post: { id: novoId, ... } }
          const restoredPost = { ...deletedPost.post, id: restored.post.id };
          const newPosts = [...posts];
          newPosts.splice(deletedPost.index, 0, restoredPost);
          setPosts(newPosts);
          setDeletedPost(null);
          if (undoTimer) clearTimeout(undoTimer);
        }
      } catch (err) {
        console.error('Error restoring post:', err);
      }
    }
  };

  const handleSaveEdit = async (updatedPost: { id: string; title: string; content: string; tags: string[]; mood?: string; weather?: string; musicPlaying?: string }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/api/posts/admin/${updatedPost.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        title: updatedPost.title,
        content: updatedPost.content,
        tags: updatedPost.tags,
        metadata: {
          mood: updatedPost.mood,
          weather: updatedPost.weather,
          listening: updatedPost.musicPlaying,
        },
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || `Erro ao editar post: ${response.status}`);
    }

    const result = await response.json();
    setPosts(prev =>
      prev.map(p => (p.id === Number(updatedPost.id) ? { ...p, ...result.post, tag: updatedPost.tags[0] ?? p.tag } : p))
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in an input or textarea
      const isTyping = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      
      // Global shortcuts
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        setIsCreatingPost(true);
        return;
      }

      if (e.key === '?') {
        if (!isTyping) {
          e.preventDefault();
          setShowShortcuts(prev => !prev);
        }
        return;
      }

      if (e.key === 'Escape') {
        if (selectedImage) {
          setSelectedImage(null);
          return;
        }
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        if (isCreatingPost) {
          setIsCreatingPost(false);
          return;
        }
        if (focusedIndex !== -1) {
          setFocusedIndex(-1);
          return;
        }
      }

      // Creation mode shortcuts
      if (isCreatingPost) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          handlePublish();
          return;
        }
        return;
      }

      // Navigation shortcuts (only if not typing)
      if (!isTyping && !isCreatingPost) {
        if (e.key === 'j' || e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, filteredPosts.length - 1));
        } else if (e.key === 'k' || e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && focusedIndex !== -1) {
          e.preventDefault();
          toggleMetadata(filteredPosts[focusedIndex].id);
        } else if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // Just 'n' to create new post if not typing
          e.preventDefault();
          setIsCreatingPost(true);
        } else if (e.key === '/') {
          e.preventDefault();
          const searchInput = document.querySelector('input[placeholder="Search posts..."]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreatingPost, filteredPosts, focusedIndex, showShortcuts, selectedImage, postTitle, postContent, postTag, postImage, postImageText, handlePublish]);

  useEffect(() => {
    if (focusedIndex !== -1) {
      const element = document.getElementById(`post-${filteredPosts[focusedIndex].id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [focusedIndex, filteredPosts]);

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onUnlock={() => {
          setIsAuthenticated(true);
          setAuthToken(localStorage.getItem('auth_token'));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between py-6 border-b border-[var(--theme-border-primary)] mb-8">
        <div className="flex items-center gap-3">
          <Terminal className="w-8 h-8 text-[var(--theme-primary)]" />
          <h1
            className="text-3xl font-bold logo-glitch cursor-pointer"
            data-text="ChronoPrivative"
            onClick={() => setIsCreatingPost(false)}
          >
            ChronoPrivative
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[var(--theme-text-secondary)] bg-[var(--theme-bg-secondary)] px-3 py-1.5 rounded border border-[var(--theme-border-primary)]">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Personal Diary</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-[var(--theme-bg-tertiary)] flex items-center justify-center border border-[var(--theme-border-primary)] hover:border-[var(--theme-secondary)] transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <main className="flex-1 space-y-6">
          {isCreatingPost ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="space-y-6 animate-fade-in relative"
            >
              {/* Global Drag Overlay */}
              <AnimatePresence>
                {isDragging && !isPreviewMode && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[60] bg-[var(--theme-bg-primary)]/80 backdrop-blur-sm border-4 border-dashed border-[var(--theme-primary)] flex flex-col items-center justify-center rounded-lg shadow-[0_0_50px_rgba(var(--theme-primary-rgb),0.3)] pointer-events-none"
                  >
                    <motion.div
                      animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex flex-col items-center"
                    >
                      <ImageIcon className="w-20 h-20 text-[var(--theme-primary)] mb-4 drop-shadow-[0_0_10px_var(--theme-primary)]" />
                      <h3 className="text-2xl font-bold text-[var(--theme-primary)] font-mono tracking-widest">DROP_IMAGE_HERE</h3>
                      <p className="text-[var(--theme-text-secondary)] font-mono mt-2 uppercase">Release to attach to your entry</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => setIsCreatingPost(false)}
                  className="flex items-center gap-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Timeline
                </button>
                <div className="flex bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] rounded p-1">
                  <button 
                    onClick={() => setIsPreviewMode(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${!isPreviewMode ? 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-primary)] font-bold' : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-light)]'}`}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => setIsPreviewMode(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${isPreviewMode ? 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-secondary)] font-bold' : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-light)]'}`}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </div>
              </div>

              {!isPreviewMode ? (
                <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] p-6 rounded-sm space-y-6">
                  {hasDraft && (!postTitle && !postContent) && (
                    <div className="bg-[var(--theme-bg-tertiary)] border border-[var(--theme-primary)] p-4 rounded-sm flex items-center justify-between mb-4 animate-fade-in shadow-[0_0_15px_rgba(148,0,255,0.1)]">
                      <div className="flex items-center gap-2 text-[var(--theme-text-primary)] text-sm">
                        <Save className="w-4 h-4 text-[var(--theme-primary)]" />
                        <span>An unsaved draft was found.</span>
                      </div>
                      <button 
                        onClick={restoreDraft}
                        className="flex items-center gap-2 text-xs bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white px-3 py-1.5 rounded-sm transition-colors font-bold tracking-wider"
                      >
                        <RefreshCw className="w-3 h-3" />
                        RESTORE DRAFT
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-[var(--theme-text-secondary)] mb-2">ENTRY TITLE</label>
                    <TerminalInput 
                      type="text" 
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="What's on your mind?"
                      className="w-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] rounded p-3 text-[var(--theme-text-primary)] focus-within:border-[var(--theme-primary)] transition-colors font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-[var(--theme-text-secondary)] mb-2">TAG</label>
                    <select 
                      value={postTag}
                      onChange={(e) => setPostTag(e.target.value)}
                      className="w-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] rounded p-3 text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)] transition-colors font-mono appearance-none"
                    >
                      <option value="LIFE">LIFE</option>
                      <option value="THOUGHTS">THOUGHTS</option>
                      <option value="TRAVEL">TRAVEL</option>
                      <option value="MUSIC">MUSIC</option>
                      <option value="RANDOM">RANDOM</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[var(--theme-text-secondary)] mb-2">MOOD</label>
                      <TerminalInput 
                        value={postMood}
                        onChange={(e) => setPostMood(e.target.value)}
                        placeholder="Feeling..."
                        className="w-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] rounded p-2 text-[var(--theme-text-primary)] focus-within:border-[var(--theme-primary)] transition-colors font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--theme-text-secondary)] mb-2">WEATHER</label>
                      <TerminalInput 
                        value={postWeather}
                        onChange={(e) => setPostWeather(e.target.value)}
                        placeholder="Sky is..."
                        className="w-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] rounded p-2 text-[var(--theme-text-primary)] focus-within:border-[var(--theme-primary)] transition-colors font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--theme-text-secondary)] mb-2">LISTENING TO</label>
                      <TerminalInput 
                        value={postListening}
                        onChange={(e) => setPostListening(e.target.value)}
                        placeholder="Track name..."
                        className="w-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] rounded p-2 text-[var(--theme-text-primary)] focus-within:border-[var(--theme-primary)] transition-colors font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-[var(--theme-text-secondary)]">ATTACH IMAGE</label>
                      {!postImage && (
                        <button 
                          onClick={() => document.getElementById('image-upload-input')?.click()}
                          className="text-xs text-[var(--theme-primary)] hover:underline flex items-center gap-1 font-mono"
                        >
                          <Plus className="w-3 h-3" /> ADD IMAGE
                        </button>
                      )}
                    </div>
                    {!postImage ? (
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded p-8 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                          isDragging 
                            ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 scale-[1.02] shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.2)]" 
                            : "border-[var(--theme-border-primary)] text-[var(--theme-text-secondary)] hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] bg-[var(--theme-bg-tertiary)]"
                        }`}
                      >
                        <input 
                          id="image-upload-input"
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <motion.div
                          animate={isDragging ? { y: [0, -10, 0] } : {}}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ImageIcon className={`w-10 h-10 mb-3 ${isDragging ? "text-[var(--theme-primary)]" : ""}`} />
                        </motion.div>
                        <span className={`text-sm font-mono font-bold tracking-wider ${isDragging ? "text-[var(--theme-primary)]" : ""}`}>
                          {isDragging ? "DROP_TO_UPLOAD" : "CLICK_OR_DRAG_TO_UPLOAD"}
                        </span>
                        <span className="text-[10px] opacity-50 mt-2 uppercase tracking-widest">
                          Format: JPG, PNG, GIF // Max: 5MB
                        </span>
                        
                        {isDragging && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 border-2 border-[var(--theme-primary)] animate-pulse pointer-events-none"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="relative border border-[var(--theme-border-primary)] rounded p-2 bg-[var(--theme-bg-tertiary)]">
                        <button 
                          onClick={removeImage}
                          className="absolute top-4 right-4 z-10 bg-[var(--theme-bg-primary)] border border-[var(--theme-border-primary)] text-[var(--theme-text-primary)] hover:text-red-500 hover:border-red-500 rounded p-1 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <RetroImagePlaceholder 
                          src={postImage} 
                          text={postImageText} 
                          altText={`Preview image for entry: ${postTitle || "Untitled"}`}
                          className="w-full h-48 sm:h-64" 
                          onClick={() => postImage && setSelectedImage({ url: postImage, title: postImageText })}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-[var(--theme-text-secondary)]">CONTENT</label>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
                          className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors p-1"
                          title="Markdown Help"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-2 p-1 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] rounded-sm overflow-x-auto scrollbar-hide">
                      <button onClick={() => insertMarkdown("**", "**")} className="p-1.5 hover:bg-[var(--theme-primary)]/20 text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] rounded transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
                      <button onClick={() => insertMarkdown("*", "*")} className="p-1.5 hover:bg-[var(--theme-primary)]/20 text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] rounded transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
                      <button onClick={() => insertMarkdown("[", "](url)")} className="p-1.5 hover:bg-[var(--theme-primary)]/20 text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] rounded transition-colors" title="Link"><LinkIcon className="w-4 h-4" /></button>
                      <div className="w-px h-4 bg-[var(--theme-border-primary)] mx-1" />
                      <button onClick={() => insertMarkdown("- ")} className="p-1.5 hover:bg-[var(--theme-primary)]/20 text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] rounded transition-colors" title="List"><List className="w-4 h-4" /></button>
                      <button onClick={() => insertMarkdown("> ")} className="p-1.5 hover:bg-[var(--theme-primary)]/20 text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] rounded transition-colors" title="Quote"><Quote className="w-4 h-4" /></button>
                      <button onClick={() => insertMarkdown("`", "`")} className="p-1.5 hover:bg-[var(--theme-primary)]/20 text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] rounded transition-colors" title="Code"><Code className="w-4 h-4" /></button>
                    </div>

                    {showMarkdownHelp && (
                      <div className="mb-4 p-3 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-primary)]/30 rounded-sm text-xs font-mono text-[var(--theme-text-secondary)] animate-fade-in">
                        <div className="grid grid-cols-2 gap-2">
                          <div><span className="text-[var(--theme-primary)]">**bold**</span> - Negrito</div>
                          <div><span className="text-[var(--theme-primary)]">*italic*</span> - Itálico</div>
                          <div><span className="text-[var(--theme-primary)]">[link](url)</span> - Link</div>
                          <div><span className="text-[var(--theme-primary)]">- item</span> - Lista</div>
                          <div><span className="text-[var(--theme-primary)]">{">"} quote</span> - Citação</div>
                          <div><span className="text-[var(--theme-primary)]">`code`</span> - Código</div>
                        </div>
                      </div>
                    )}

                    <TerminalTextarea 
                      ref={contentRef}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Write your entry here... (Markdown supported in preview)"
                      rows={10}
                      className="w-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] rounded p-3 text-[var(--theme-text-primary)] focus-within:border-[var(--theme-primary)] transition-colors font-mono resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--theme-border-primary)]">
                    <div className="text-xs text-[var(--theme-text-secondary)] flex items-center gap-2 font-mono">
                      {lastSaved ? (
                        <>
                          <Save className="w-3 h-3" />
                          Draft auto-saved at {lastSaved.toLocaleTimeString()}
                        </>
                      ) : (
                        <span className="opacity-50">Auto-save active (30s)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsCreatingPost(false)}
                        className="bg-[var(--theme-bg-tertiary)] hover:bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] text-[var(--theme-text-primary)] font-bold py-2 px-6 rounded-sm transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button 
                        onClick={() => setIsPreviewMode(true)}
                        className="bg-[var(--theme-bg-tertiary)] hover:bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] text-[var(--theme-text-primary)] font-bold py-2 px-6 rounded-sm transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button 
                        onClick={handlePublish}
                        className="bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white font-bold py-2 px-6 rounded-sm transition-colors flex items-center gap-2 shadow-[0_0_10px_var(--theme-primary)]"
                      >
                        <Send className="w-4 h-4" />
                        Publish Entry
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-sm text-[var(--theme-text-secondary)] flex items-center gap-2 mb-2">
                    <Terminal className="w-4 h-4" />
                    Previewing as it will appear on the timeline:
                  </div>
                  
                  <article className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-secondary)] p-6 rounded-sm shadow-[0_0_15px_rgba(148,0,255,0.2)] group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--theme-bg-tertiary)] rounded-full flex items-center justify-center border border-[var(--theme-border-primary)] overflow-hidden relative">
                          <Image src="https://picsum.photos/seed/juan/100/100" alt="Juan" fill className="object-cover opacity-80" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--theme-text-light)]">
                            Juan
                          </h3>
                          <p className="text-xs text-[var(--theme-text-secondary)]">
                            Just now
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-[var(--theme-primary)] border border-[var(--theme-primary)] px-2 py-1 rounded">
                        {postTag}
                      </div>
                    </div>
                    <div className="space-y-4 text-[var(--theme-text-primary)]">
                      <h4 className="text-lg font-bold">{postTitle || "Untitled Entry"}</h4>
                      
                      <div className="flex flex-wrap gap-3 text-[10px] font-mono text-[var(--theme-text-secondary)] bg-[var(--theme-bg-tertiary)]/50 p-2 rounded border border-[var(--theme-border-primary)]/30">
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--theme-primary)]">MOOD:</span> {postMood}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--theme-primary)]">WEATHER:</span> {postWeather}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--theme-primary)]">LISTENING:</span> {postListening}
                        </div>
                      </div>

                      {postImage && (
                        <div className="mb-4">
                          <RetroImagePlaceholder 
                            src={postImage} 
                            text={postImageText} 
                            altText={`Preview image for entry: ${postTitle || "Untitled"}`}
                            className="w-full h-48 sm:h-64" 
                            onClick={() => postImage && setSelectedImage({ url: postImage, title: postImageText })}
                          />
                        </div>
                      )}
                      <div className="leading-relaxed">
                        <TypewriterText text={postContent || "No content provided."} />
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[var(--theme-border-primary)] flex items-center gap-4 text-sm text-[var(--theme-text-secondary)]">
                      <button className="hover:text-[var(--theme-primary)] transition-colors">
                        0 Comments
                      </button>
                      <span>•</span>
                      <button className="hover:text-[var(--theme-primary)] transition-colors">
                        Share
                      </button>
                    </div>
                  </article>

                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={() => setIsPreviewMode(false)}
                      className="bg-[var(--theme-bg-tertiary)] hover:bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] text-[var(--theme-text-primary)] font-bold py-2 px-6 rounded-sm transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Keep Editing
                    </button>
                    <button 
                      onClick={handlePublish}
                      className="bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white font-bold py-2 px-6 rounded-sm transition-colors flex items-center gap-2 shadow-[0_0_10px_var(--theme-primary)]"
                    >
                      <Send className="w-4 h-4" />
                      Publish Entry
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader className="w-8 h-8 text-[var(--theme-primary)]" />
                  </motion.div>
                  <span className="ml-3 text-[var(--theme-text-secondary)] font-mono">LOADING_POSTS...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-sm mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <div>
                    <p className="font-bold">Error loading posts</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {!loading && posts.length === 0 && !error && (
                <div className="text-center py-12 text-[var(--theme-text-secondary)] border border-dashed border-[var(--theme-border-primary)] rounded-sm">
                  <p>No posts yet. Create your first diary entry!</p>
                </div>
              )}

              {!loading && posts.length > 0 && (
                <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-[var(--theme-secondary)] flex items-center gap-2 whitespace-nowrap">
                    <Clock className="w-5 h-5" />
                    Timeline
                  </h2>
                  <button
                    onClick={refresh}
                    disabled={loading}
                    className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors disabled:opacity-50"
                    title="Refresh posts"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  {selectedTag && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[var(--theme-text-secondary)] hidden sm:inline">Filtered by:</span>
                      <span className="text-xs text-[var(--theme-primary)] border border-[var(--theme-primary)] px-2 py-1 rounded bg-[var(--theme-primary)]/10">
                        {selectedTag}
                      </span>
                      <button 
                        onClick={() => setSelectedTag(null)}
                        className="text-xs text-[var(--theme-text-secondary)] hover:text-white transition-colors underline"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Search className="h-4 w-4 text-[var(--theme-text-secondary)]" />
                  </div>
                  <TerminalInput
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] text-[var(--theme-text-primary)] pl-10 pr-4 py-2 rounded-sm focus-within:border-[var(--theme-primary)] transition-colors placeholder:text-[var(--theme-text-secondary)]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--theme-text-secondary)] hover:text-white transition-colors"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {(searchQuery || selectedTag) && (
                <div className="mb-6 flex items-center justify-between bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] p-3 rounded-sm">
                  <div className="text-sm text-[var(--theme-text-secondary)]">
                    Showing results for: 
                    {searchQuery && <span className="text-white ml-2 font-bold">&quot;{searchQuery}&quot;</span>}
                    {searchQuery && selectedTag && <span className="mx-2">and</span>}
                    {selectedTag && <span className="text-[var(--theme-primary)] ml-1 border border-[var(--theme-primary)] px-2 py-0.5 rounded text-xs">{selectedTag}</span>}
                  </div>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTag(null);
                    }}
                    className="text-xs text-[var(--theme-primary)] hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear filters
                  </button>
                </div>
              )}

              {filteredPosts.length === 0 && (
                <div className="text-center py-12 text-[var(--theme-text-secondary)] border border-dashed border-[var(--theme-border-primary)] rounded-sm">
                  <p>No posts found matching your criteria.</p>
                  {(selectedTag || searchQuery) && (
                    <button 
                      onClick={() => {
                        setSelectedTag(null);
                        setSearchQuery("");
                      }}
                      className="mt-4 text-[var(--theme-primary)] hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, index) => (
                  <motion.article 
                    key={post.id} 
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -50 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    transition={{ duration: 0.3 }}
                    id={`post-${post.id}`}
                    className={`bg-[var(--theme-bg-secondary)] border p-6 rounded-sm transition-all group relative mb-6 shadow-sm hover:shadow-[0_15px_35px_-10px_rgba(var(--theme-primary-rgb),0.3)] ${
                      index === focusedIndex 
                        ? "border-[var(--theme-primary)] shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.4)] ring-1 ring-[var(--theme-primary)]" 
                        : "border-[var(--theme-border-primary)] hover:border-[var(--theme-secondary)]"
                    }`}
                  >
                    {index === focusedIndex && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 bg-[var(--theme-primary)] shadow-[0_0_10px_var(--theme-primary)]" />
                    )}
                    <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--theme-bg-tertiary)] rounded-full flex items-center justify-center border border-[var(--theme-border-primary)] overflow-hidden relative">
                        <Image src="https://picsum.photos/seed/juan/100/100" alt="Juan" fill className="object-cover opacity-80" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--theme-text-light)]">
                          Juan
                        </h3>
                        <p className="text-xs text-[var(--theme-text-secondary)]">
                          {formatTimeAgo(post.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSelectedTag(post.tag)}
                        className="text-xs text-[var(--theme-primary)] border border-[var(--theme-primary)] px-2 py-1 rounded hover:bg-[var(--theme-primary)]/10 transition-colors"
                      >
                        <HighlightText text={post.tag} query={searchQuery} />
                      </button>
                      <button
                        onClick={() => setEditingPost(post)}
                        className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Edit Entry"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(post)}
                        className="text-[var(--theme-text-secondary)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 text-[var(--theme-text-primary)]">
                    <h4 className="text-lg font-bold">
                      <HighlightText text={post.title} query={searchQuery} />
                    </h4>
                    {!!(post as any).imageUrl && (
                      <div className="mb-4">
                        <RetroImagePlaceholder 
                          src={(post as any).imageUrl as string} 
                          text={(post as any).imageText as string | undefined} 
                          altText={`Entry image: ${post.title}`}
                          className="w-full h-48 sm:h-64" 
                          onClick={() => (post as any).imageUrl && setSelectedImage({ url: (post as any).imageUrl, title: (post as any).imageText || "Untitled" })}
                        />
                      </div>
                    )}
                    <div className="leading-relaxed">
                      <TypewriterText text={post.content} />
                    </div>
                    {post.metadata && (
                      <div className="mt-4">
                        <button
                          onClick={() => toggleMetadata(post.id)}
                          className="text-xs font-mono text-[var(--theme-primary)] hover:text-[var(--theme-secondary)] flex items-center gap-1 transition-colors"
                        >
                          <Terminal className="w-3 h-3" />
                          {expandedMetadata[post.id] ? "[-] HIDE_METADATA" : "[+] SHOW_METADATA"}
                        </button>
                        <AnimatePresence>
                          {expandedMetadata[post.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-[#020005] rounded-md border-2 border-[var(--theme-primary)] font-mono text-sm relative overflow-hidden shadow-[0_0_20px_rgba(148,0,255,0.3)] before:content-[''] before:absolute before:inset-0 before:ring-1 before:ring-inset before:ring-white/10">
                                {/* Header */}
                                <div className="bg-[var(--theme-primary)] text-white px-3 py-2 flex items-center justify-between text-xs font-bold tracking-widest border-b-2 border-[var(--theme-primary)]">
                                  <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4" />
                                    <span className="glitch-effect" data-text="SYS.LOG.METADATA">SYS.LOG.METADATA</span>
                                  </div>
                                  <span className="animate-[blink_1s_step-end_infinite] text-[var(--theme-bg-primary)] bg-white px-1.5 py-0.5 rounded-sm">REC</span>
                                </div>
                                {/* Body */}
                                <div className="p-5 space-y-4 text-[var(--theme-primary)] relative z-10">
                                  <div className="flex items-center gap-2 text-xs opacity-90">
                                    <span className="text-[var(--theme-text-secondary)]">{'>'}</span>
                                    <span className="animate-[pulse_2s_ease-in-out_infinite]">INITIALIZING_SENSORS...</span>
                                    <span className="text-green-400 font-bold">[OK]</span>
                                  </div>
                                  
                                  <div className="pl-4 border-l-2 border-dashed border-[var(--theme-primary)]/50 space-y-3 mt-2 py-1">
                                    <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-3">
                                      <span className="text-[var(--theme-text-secondary)] w-32 tracking-wider text-xs">VAR_MOOD:</span>
                                      <span className="text-[var(--theme-text-light)] bg-[#1a0b2e] px-3 py-1 rounded-sm border border-[var(--theme-primary)]/40 shadow-[inset_0_0_10px_rgba(148,0,255,0.2)] flex items-center gap-2">
                                        {post.metadata.mood}
                                        <span className="inline-block w-1.5 h-3 bg-[var(--theme-primary)] animate-[blink_1s_step-end_infinite]"></span>
                                      </span>
                                    </div>
                                    <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-3">
                                      <span className="text-[var(--theme-text-secondary)] w-32 tracking-wider text-xs">VAR_WEATHER:</span>
                                      <span className="text-[var(--theme-text-light)] bg-[#1a0b2e] px-3 py-1 rounded-sm border border-[var(--theme-primary)]/40 shadow-[inset_0_0_10px_rgba(148,0,255,0.2)] flex items-center gap-2">
                                        {post.metadata.weather}
                                        <span className="inline-block w-1.5 h-3 bg-[var(--theme-primary)] animate-[blink_1s_step-end_infinite]" style={{ animationDelay: '0.3s' }}></span>
                                      </span>
                                    </div>
                                    <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-3">
                                      <span className="text-[var(--theme-text-secondary)] w-32 tracking-wider text-xs">VAR_AUDIO:</span>
                                      <span className="text-[var(--theme-text-light)] bg-[#1a0b2e] px-3 py-1 rounded-sm border border-[var(--theme-primary)]/40 shadow-[inset_0_0_10px_rgba(148,0,255,0.2)] flex items-center gap-2">
                                        {post.metadata.listening}
                                        <span className="inline-block w-1.5 h-3 bg-[var(--theme-primary)] animate-[blink_1s_step-end_infinite]" style={{ animationDelay: '0.6s' }}></span>
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 pt-3 text-xs opacity-90 border-t border-[var(--theme-primary)]/20">
                                    <span className="text-[var(--theme-text-secondary)]">{'>'}</span>
                                    <span className="tracking-widest">AWAITING_INPUT</span>
                                    <span className="inline-block w-2.5 h-4 bg-[var(--theme-primary)] animate-[blink_1s_step-end_infinite]" />
                                  </div>
                                </div>
                                {/* Scanline overlay */}
                                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-30 z-0"></div>
                                {/* Screen glare */}
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50 z-0"></div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-[var(--theme-border-primary)] flex items-center gap-4 text-sm text-[var(--theme-text-secondary)]">
                    <button className="hover:text-[var(--theme-primary)] transition-colors">
                      0 Comments
                    </button>
                    <span>•</span>
                    <button className="hover:text-[var(--theme-primary)] transition-colors">
                      Share
                    </button>
                  </div>
                  </motion.article>
                ))}
              </AnimatePresence>
                </>
              )}
            </>
          )}
        </main>

        {/* Sidebar */}
        <aside className="w-full md:w-80 flex flex-col gap-6 md:sticky md:top-8 self-start">
          {/* Create Post Button */}
          {!isCreatingPost && (
            <button 
              onClick={handleCreatePost}
              className="w-full bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white font-bold py-3 px-4 rounded-sm transition-colors flex items-center justify-center gap-2 shadow-[0_0_10px_var(--theme-primary)] hover:shadow-[0_0_15px_var(--theme-secondary)]"
            >
              <Plus className="w-5 h-5" />
              NEW DIARY ENTRY
            </button>
          )}

          {/* About Widget */}
          <AboutWidget
            bio={userBio}
            token={authToken ?? undefined}
            onBioUpdate={setUserBio}
          />

          {/* Topics Widget */}
          <TopicsWidget />

          {/* Archives Widget */}
          <ArchivesWidget />
        </aside>
      </div>

      <footer className="mt-auto py-8 border-t border-[var(--theme-border-primary)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--theme-text-secondary)]">
        <div className="flex items-center gap-4">
          <p>© 2024 CHRONOPRIVATIVE // SECURE LOGGING SYSTEM</p>
          <button 
            onClick={() => setShowShortcuts(true)}
            className="hover:text-[var(--theme-primary)] transition-colors flex items-center gap-1"
          >
            <Lock className="w-3 h-3" /> Keyboard Shortcuts (?)
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3" />
            <span>ENCRYPTION: AES-256</span>
          </div>
        </div>
      </footer>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--theme-bg-tertiary)] border border-[var(--theme-primary)] p-8 rounded-sm max-w-md w-full shadow-[0_0_30px_rgba(var(--theme-primary-rgb),0.2)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6 border-b border-[var(--theme-border-primary)] pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--theme-primary)]">
                  <Terminal className="w-5 h-5" /> SYSTEM_SHORTCUTS
                </h2>
                <button onClick={() => setShowShortcuts(false)} className="text-[var(--theme-text-secondary)] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold text-[var(--theme-text-secondary)] uppercase tracking-widest mb-3">Global</h3>
                  <div className="space-y-2">
                    <ShortcutRow keys={["?"]} label="Toggle this menu" />
                    <ShortcutRow keys={["/"]} label="Focus search" />
                    <ShortcutRow keys={["Alt", "N"]} label="New post (anywhere)" />
                    <ShortcutRow keys={["Esc"]} label="Cancel / Close" />
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-[var(--theme-text-secondary)] uppercase tracking-widest mb-3">Navigation</h3>
                  <div className="space-y-2">
                    <ShortcutRow keys={["J", "↓"]} label="Next post" />
                    <ShortcutRow keys={["K", "↑"]} label="Previous post" />
                    <ShortcutRow keys={["Enter"]} label="Expand metadata" />
                    <ShortcutRow keys={["N"]} label="New post" />
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-[var(--theme-text-secondary)] uppercase tracking-widest mb-3">Editor</h3>
                  <div className="space-y-2">
                    <ShortcutRow keys={["Ctrl", "S"]} label="Publish / Save" />
                  </div>
                </section>
              </div>

              <div className="mt-8 pt-4 border-t border-[var(--theme-border-primary)] text-center">
                <p className="text-[10px] text-[var(--theme-text-secondary)] opacity-50 font-mono">
                  CHRONOPRIVATIVE V1.0.4 // COMMAND_LINE_INTERFACE
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full h-full max-h-[90vh] flex flex-col items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 -mt-12 flex items-center gap-4">
                <span className="text-[var(--theme-primary)] font-mono text-xs tracking-widest bg-black/50 px-3 py-1 border border-[var(--theme-primary)]/30 rounded-sm">
                  {selectedImage.title}
                </span>
                <button onClick={() => setSelectedImage(null)} className="text-white hover:text-[var(--theme-primary)] transition-colors p-2">
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <div className="relative w-full h-full border-2 border-[var(--theme-primary)] shadow-[0_0_50px_rgba(var(--theme-primary-rgb),0.3)] overflow-hidden bg-black">
                <Image 
                  src={selectedImage.url} 
                  alt={selectedImage.title} 
                  fill 
                  className="object-contain"
                  referrerPolicy="no-referrer"
                />
                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-20 z-10"></div>
              </div>
              
              <div className="mt-4 text-[var(--theme-text-secondary)] font-mono text-[10px] tracking-widest flex items-center gap-4">
                <span>CHRONOPRIVATIVE_IMAGE_VIEWER_V1.0</span>
                <span>•</span>
                <span>ESC_TO_CLOSE</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo Delete Toast */}
      <AnimatePresence>
        {deletedPost && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--theme-bg-secondary)] border-2 border-[var(--theme-primary)] p-0 rounded-sm shadow-[0_0_30px_rgba(var(--theme-primary-rgb),0.3)] flex flex-col z-[1000] font-mono min-w-[300px] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center border border-red-500/50">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-[var(--theme-text-primary)] font-bold text-sm">ENTRY_DELETED</p>
                  <p className="text-[var(--theme-text-secondary)] text-[10px] uppercase tracking-widest">Post has been removed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleUndo}
                  className="flex items-center gap-2 bg-[var(--theme-primary)] text-white px-3 py-1.5 rounded-sm hover:bg-[var(--theme-secondary)] font-bold text-xs tracking-wider transition-all shadow-[0_0_10px_rgba(var(--theme-primary-rgb),0.4)] active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  UNDO
                </button>
                <button 
                  onClick={() => {
                    setDeletedPost(null);
                    if (undoTimer) clearTimeout(undoTimer);
                  }}
                  className="text-[var(--theme-text-secondary)] hover:text-white p-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Progress bar timer */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-1 bg-[var(--theme-primary)] shadow-[0_0_10px_var(--theme-primary)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {editingPost && (
        <EditPostModal
          post={{
            id: editingPost.id.toString(),
            title: editingPost.title,
            content: editingPost.content,
            mood: editingPost.metadata?.mood,
            weather: editingPost.metadata?.weather,
            musicPlaying: editingPost.metadata?.listening,
            tags: editingPost.tag ? [editingPost.tag] : [],
          }}
          isOpen={true}
          onClose={() => setEditingPost(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

function ShortcutRow({ keys, label }: { keys: string[], label: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--theme-text-secondary)]">{label}</span>
      <div className="flex gap-1">
        {keys.map(key => (
          <kbd key={key} className="bg-[var(--theme-bg-primary)] border border-[var(--theme-border-primary)] px-1.5 py-0.5 rounded text-[var(--theme-primary)] font-mono text-xs min-w-[1.5rem] text-center shadow-[0_2px_0_rgba(0,0,0,0.5)]">
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
