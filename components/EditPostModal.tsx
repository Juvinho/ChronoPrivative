'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface EditPostModalProps {
  post: {
    id: string;
    title: string;
    content: string;
    mood?: string;
    weather?: string;
    musicPlaying?: string;
    tags: string[];
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: any) => Promise<void>;
}

const MOOD_OPTIONS = ['happy', 'neutral', 'melancoly', 'stressed'];
const WEATHER_OPTIONS = ['sunny', 'cloudy', 'rainy', 'snowy'];

export default function EditPostModal({ post, isOpen, onClose, onSave }: EditPostModalProps) {
  const [formData, setFormData] = useState({
    title: post.title,
    content: post.content,
    mood: post.mood || 'neutral',
    weather: post.weather || 'sunny',
    musicPlaying: post.musicPlaying || '',
    tags: post.tags || [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setError(null);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.toUpperCase())) {
      handleFieldChange('tags', [...formData.tags, newTag.toUpperCase()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleFieldChange('tags', formData.tags.filter(t => t !== tag));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return;
    }
    if (!formData.content.trim()) {
      setError('Conteúdo é obrigatório');
      return;
    }
    if (formData.content.length > 10000) {
      setError('Conteúdo muito longo (máx 10.000 caracteres)');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        ...post,
        ...formData,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1A0B2E] to-[#0A0015] border-2 border-[#9400FF] rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1A0B2E] border-b border-[#9400FF] p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#9400FF] flex items-center gap-2">
            ✎ EDITAR POST
          </h2>
          <button
            onClick={onClose}
            className="text-[#9400FF] hover:text-[#00FF00] transition-colors"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 rounded border-l-4 border-red-500 bg-red-500/10 text-red-400 flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[#9400FF] mb-2">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full bg-[#0A0015] border border-[#9400FF] rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF00] transition-colors"
              placeholder="Nome do post..."
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-[#9400FF] mb-2">Conteúdo</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              className="w-full h-32 bg-[#0A0015] border border-[#9400FF] rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF00] transition-colors resize-none"
              placeholder="Seus pensamentos..."
              maxLength={10000}
            />
            <p className="text-xs text-gray-400 mt-1">{formData.content.length}/10.000</p>
          </div>

          {/* Mood & Weather */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#9400FF] mb-2">Mood</label>
              <select
                value={formData.mood}
                onChange={(e) => handleFieldChange('mood', e.target.value)}
                className="w-full bg-[#0A0015] border border-[#9400FF] rounded px-3 py-2 text-white focus:outline-none focus:border-[#00FF00] transition-colors"
              >
                {MOOD_OPTIONS.map(mood => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#9400FF] mb-2">Tempo</label>
              <select
                value={formData.weather}
                onChange={(e) => handleFieldChange('weather', e.target.value)}
                className="w-full bg-[#0A0015] border border-[#9400FF] rounded px-3 py-2 text-white focus:outline-none focus:border-[#00FF00] transition-colors"
              >
                {WEATHER_OPTIONS.map(weather => (
                  <option key={weather} value={weather}>{weather}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Music */}
          <div>
            <label className="block text-sm font-semibold text-[#9400FF] mb-2">♪ Música</label>
            <input
              type="text"
              value={formData.musicPlaying}
              onChange={(e) => handleFieldChange('musicPlaying', e.target.value)}
              className="w-full bg-[#0A0015] border border-[#9400FF] rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF00] transition-colors"
              placeholder="Artist - Song"
              maxLength={100}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-[#9400FF] mb-2">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#9400FF]/20 border border-[#9400FF] rounded text-[#9400FF] text-sm flex items-center gap-2 group"
                >
                  ${tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[#9400FF] hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 bg-[#0A0015] border border-[#9400FF] rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF00] transition-colors"
                placeholder="Nova tag..."
                maxLength={20}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-[#9400FF] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors font-semibold"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[#9400FF]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-transparent border border-gray-500 text-gray-400 rounded hover:border-[#9400FF] hover:text-[#9400FF] transition-colors font-semibold"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !isDirty}
              className="px-6 py-2 bg-[#9400FF] text-white rounded hover:bg-[#00FF00] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Salvar ✓
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
