'use client';

import React, { useState } from 'react';
import { X, Star, Heart, ArrowRight } from 'lucide-react';

interface SerendipityPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
  weather?: string;
  tags?: string[];
}

interface SerendipityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFetch: () => Promise<SerendipityPost | null>;
  onSelect: (post: SerendipityPost) => void;
  isLoading?: boolean;
}

export default function SerendipityModal({
  isOpen,
  onClose,
  onFetch,
  onSelect,
  isLoading = false,
}: SerendipityModalProps) {
  const [post, setPost] = useState<SerendipityPost | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchRandom = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const randomPost = await onFetch();
      if (randomPost) {
        setPost(randomPost);
      } else {
        setError('Nenhum post encontrado');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar post');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSelect = () => {
    if (post) {
      onSelect(post);
      onClose();
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'hoje';
    if (days === 1) return 'ontem';
    if (days < 30) return `${days}d atrás`;
    if (days < 365) return `${Math.floor(days / 30)}m atrás`;
    return `${Math.floor(days / 365)}a atrás`;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#0A0015] border-2 border-[#9400FF] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in scale-in-95 duration-300 shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0015] border-b border-[#9400FF] p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Star size={24} className="text-[#9400FF]" />
            <h2 className="text-xl font-bold text-[#9400FF]">SERENDIPIDADE</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9400FF] hover:text-[#00FF00] hover:bg-[#9400FF]/10 rounded transition-colors"
            title="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!post ? (
            <div className="space-y-4 min-h-96 flex flex-col justify-center">
              <p className="text-gray-400 text-center text-lg">
                Descubra um post aleatório do seu arquivo pessoal
              </p>
              <p className="text-gray-500 text-center text-sm">
                Às vezes o melhor é aquilo que não estamos procurando
              </p>
              <div className="flex justify-center">
                <div className="text-6xl opacity-50">✨</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Time Indicator */}
              <div className="text-center">
                <p className="text-[#00FF00] font-semibold text-lg">
                  {getTimeAgo(post.createdAt)} ⏳
                </p>
              </div>

              {/* Post Title */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {getMoodEmoji(post.mood)} {post.title}
                </h3>
                {post.weather && (
                  <p className="text-gray-400 text-sm">{getWeatherEmoji(post.weather)} {post.weather}</p>
                )}
              </div>

              {/* Post Content */}
              <div className="p-4 bg-[#1A0B2E] border border-[#9400FF]/30 rounded-lg">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {post.content.substring(0, 500)}
                  {post.content.length > 500 ? '...' : ''}
                </p>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#9400FF]/20 border border-[#9400FF] text-[#9400FF] rounded text-sm"
                    >
                      ${tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-gray-500 border-t border-[#9400FF]/30 pt-3">
                ID: {post.id.substring(0, 8)}... | {new Date(post.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded border-l-4 border-red-500 bg-red-500/10 text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0A0015] border-t border-[#9400FF] p-4 flex gap-2">
          {post ? (
            <>
              <button
                onClick={() => setPost(null)}
                className="flex-1 px-4 py-2 border border-[#9400FF] text-[#9400FF] rounded hover:bg-[#9400FF]/10 hover:border-[#00FF00] hover:text-[#00FF00] transition-colors font-semibold"
              >
                🔄 Outro
              </button>
              <button
                onClick={handleSelect}
                className="flex-1 px-4 py-2 bg-[#9400FF] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <ArrowRight size={18} />
                Ir para Post
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-[#9400FF] text-[#9400FF] rounded hover:bg-[#9400FF]/10 hover:border-[#00FF00] hover:text-[#00FF00] transition-colors font-semibold"
              >
                Fechar
              </button>
              <button
                onClick={handleFetchRandom}
                disabled={isFetching}
                className="flex-1 px-4 py-2 bg-[#9400FF] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
              >
                <Star size={18} />
                {isFetching ? 'Buscando...' : 'Surpreenda-me!'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
