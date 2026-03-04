'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface TimelinePost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
  weather?: string;
  tags?: string[];
}

interface TimelineViewProps {
  posts: TimelinePost[];
  onLoadMore: () => Promise<void>;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onPostSelect: (post: TimelinePost) => void;
}

export default function TimelineView({
  posts,
  onLoadMore,
  isLoadingMore = false,
  hasMore = true,
  onPostSelect,
}: TimelineViewProps) {
  const [groupedPosts, setGroupedPosts] = useState<Map<string, TimelinePost[]>>(new Map());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Group posts by month
  useEffect(() => {
    const grouped = new Map<string, TimelinePost[]>();
    
    posts.forEach(post => {
      const date = new Date(post.createdAt);
      const monthKey = date
        .toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
        .toUpperCase();
      
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(post);
    });

    // Sort each month's posts by date (newest first) and months (newest first)
    grouped.forEach((monthPosts, key) => {
      monthPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    const sorted = new Map([...grouped.entries()].reverse());
    setGroupedPosts(sorted);
    
    // Expand all months by default
    setExpandedMonths(new Set(sorted.keys()));
  }, [posts]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d atrás`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}sem atrás`;
    return `${Math.floor(seconds / 2592000)}m atrás`;
  };

  const getMoodEmoji = (mood?: string): string => {
    const moods: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      calm: '😌',
      excited: '🤩',
      nostalgic: '🥺',
    };
    return mood ? moods[mood] || '📝' : '📝';
  };

  const getWeatherEmoji = (weather?: string): string => {
    const weathers: Record<string, string> = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      stormy: '⛈️',
      snowy: '❄️',
    };
    return weather ? weathers[weather] || '' : '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-lg font-bold text-[#9400FF]">
        <Calendar size={24} />
        CRONOLOGIA ({posts.length} posts)
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {groupedPosts.size === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#9400FF] rounded-lg">
            <p className="text-gray-400">Nenhum post encontrado</p>
          </div>
        ) : (
          [...groupedPosts.entries()].map(([monthKey, monthPosts]) => {
            const isExpanded = expandedMonths.has(monthKey);
            return (
              <div key={monthKey} className="border-l-2 border-[#9400FF] pl-4">
                {/* Month Header */}
                <button
                  onClick={() => toggleMonth(monthKey)}
                  className="flex items-center gap-2 mb-4 text-[#9400FF] font-bold hover:text-[#00FF00] transition-colors group"
                >
                  <ChevronDown
                    size={20}
                    className={`transform transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                  />
                  {monthKey}
                  <span className="text-gray-500 text-sm ml-2">({monthPosts.length})</span>
                </button>

                {/* Posts in Month */}
                {isExpanded && (
                  <div className="space-y-3 mb-6">
                    {monthPosts.map((post, index) => (
                      <div
                        key={post.id}
                        className="group cursor-pointer border border-[#9400FF] rounded p-3 hover:border-[#00FF00] hover:bg-[#9400FF]/5 transition-all duration-200"
                        onClick={() => onPostSelect(post)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && onPostSelect(post)}
                      >
                        {/* Timeline Dot */}
                        <div className="absolute -left-8 top-5 w-3 h-3 bg-[#9400FF] rounded-full group-hover:bg-[#00FF00] transition-colors ring-4 ring-[#0A0015]" />

                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-white group-hover:text-[#00FF00] transition-colors line-clamp-1 flex-1">
                            {getMoodEmoji(post.mood)} {post.title}
                          </h4>
                          <span className="text-[#9400FF] text-xs ml-2 whitespace-nowrap">{formatDate(post.createdAt)}</span>
                        </div>

                        {/* Post Metadata */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                          <span className="text-[#00FF00]">{formatTime(post.createdAt)}</span>
                          {post.weather && (
                            <span>{getWeatherEmoji(post.weather)}</span>
                          )}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-1">
                              {post.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 bg-[#9400FF]/20 border border-[#9400FF]/50 rounded text-[#9400FF]">
                                  ${tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-gray-500">+{post.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Post Preview */}
                        <p className="text-gray-300 text-sm line-clamp-2 group-hover:text-gray-200 transition-colors">
                          {post.content}
                        </p>

                        {/* Time Ago */}
                        <div className="text-[#00FF00] text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {getTimeAgo(post.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2 border border-[#9400FF] text-[#9400FF] rounded hover:bg-[#9400FF]/10 hover:border-[#00FF00] hover:text-[#00FF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isLoadingMore ? '⠋ Carregando...' : '⬇️ Carregar Mais'}
          </button>
        </div>
      )}

      {/* No More Posts */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500 border-t border-[#9400FF]/30">
          Você chegou ao início da cronologia
        </div>
      )}
    </div>
  );
}
