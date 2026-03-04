'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchFilters {
  query: string;
  tags: string[];
  moods: string[];
  weather: string[];
  dateFrom?: string;
  dateTo?: string;
}

interface SearchPanelProps {
  onSearch: (filters: SearchFilters) => Promise<void>;
  availableTags: string[];
  availableMoods: string[];
  availableWeather: string[];
  isLoading?: boolean;
}

const MOODS = [
  { id: 'happy', label: '😊 Feliz', color: '#FFD700' },
  { id: 'sad', label: '😢 Triste', color: '#4169E1' },
  { id: 'angry', label: '😠 Raivoso', color: '#FF4500' },
  { id: 'calm', label: '😌 Calmo', color: '#32CD32' },
  { id: 'excited', label: '🤩 Empolgado', color: '#FF1493' },
  { id: 'nostalgic', label: '🥺 Nostálgico', color: '#9370DB' },
];

const WEATHER = [
  { id: 'sunny', label: '☀️ Ensolarado' },
  { id: 'cloudy', label: '☁️ Nublado' },
  { id: 'rainy', label: '🌧️ Chovendo' },
  { id: 'stormy', label: '⛈️ Tempestade' },
  { id: 'snowy', label: '❄️ Nevando' },
];

export default function SearchPanel({
  onSearch,
  availableTags,
  availableMoods,
  availableWeather,
  isLoading = false,
}: SearchPanelProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    moods: [],
    weather: [],
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQueryChange = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, query }));
  }, []);

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleMoodToggle = (mood: string) => {
    setFilters(prev => ({
      ...prev,
      moods: prev.moods.includes(mood) ? prev.moods.filter(m => m !== mood) : [...prev.moods, mood],
    }));
  };

  const handleWeatherToggle = (weather: string) => {
    setFilters(prev => ({
      ...prev,
      weather: prev.weather.includes(weather) ? prev.weather.filter(w => w !== weather) : [...prev.weather, weather],
    }));
  };

  const handleSearch = async () => {
    try {
      setError(null);
      await onSearch(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      tags: [],
      moods: [],
      weather: [],
    });
  };

  const hasActiveFilters = filters.query || filters.tags.length > 0 || filters.moods.length > 0 || filters.weather.length > 0;

  const displayTags = useMemo(() => {
    return availableTags.filter(tag => tag).slice(0, 10);
  }, [availableTags]);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="border border-[#9400FF] rounded-lg p-4 bg-[#0A0015]">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9400FF] pointer-events-none" size={18} />
            <input
              type="text"
              placeholder="Buscar posts..."
              value={filters.query}
              onChange={e => handleQueryChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 bg-[#1A0B2E] border border-[#9400FF] rounded text-white placeholder-gray-500 focus:border-[#00FF00] focus:outline-none transition-colors"
              aria-label="Buscar posts"
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 border border-[#9400FF] rounded hover:bg-[#9400FF]/10 transition-colors text-[#9400FF]"
            title="Filtros avançados"
          >
            <Filter size={18} />
          </button>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-[#9400FF] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isLoading ? '...' : 'Buscar'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 p-3 rounded border-l-4 border-red-500 bg-red-500/10 text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border border-[#9400FF] rounded-lg p-4 bg-[#0A0015]/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Tags Filter */}
          {displayTags.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-[#9400FF] mb-2">📌 CORDÕES</label>
              <div className="flex flex-wrap gap-2">
                {displayTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded border transition-all ${
                      filters.tags.includes(tag)
                        ? 'border-[#00FF00] bg-[#00FF00]/20 text-[#00FF00]'
                        : 'border-[#9400FF] bg-[#9400FF]/10 text-[#9400FF] hover:border-[#00FF00] hover:text-[#00FF00]'
                    }`}
                  >
                    ${tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mood Filter */}
          <div>
            <label className="block text-sm font-semibold text-[#9400FF] mb-2">😊 HUMOR</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodToggle(mood.id)}
                  className={`px-3 py-1 rounded border transition-all text-sm ${
                    filters.moods.includes(mood.id)
                      ? 'border-[#00FF00] bg-[#00FF00]/20 text-[#00FF00]'
                      : 'border-[#9400FF] bg-[#9400FF]/10 text-[#9400FF] hover:border-[#00FF00] hover:text-[#00FF00]'
                  }`}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weather Filter */}
          <div>
            <label className="block text-sm font-semibold text-[#9400FF] mb-2">🌤️ CLIMA</label>
            <div className="flex flex-wrap gap-2">
              {WEATHER.map(w => (
                <button
                  key={w.id}
                  onClick={() => handleWeatherToggle(w.id)}
                  className={`px-3 py-1 rounded border transition-all text-sm ${
                    filters.weather.includes(w.id)
                      ? 'border-[#00FF00] bg-[#00FF00]/20 text-[#00FF00]'
                      : 'border-[#9400FF] bg-[#9400FF]/10 text-[#9400FF] hover:border-[#00FF00] hover:text-[#00FF00]'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#9400FF] mb-1">📅 DE</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 bg-[#1A0B2E] border border-[#9400FF] rounded text-white text-sm focus:border-[#00FF00] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#9400FF] mb-1">📅 ATÉ</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 bg-[#1A0B2E] border border-[#9400FF] rounded text-white text-sm focus:border-[#00FF00] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex-1 px-4 py-2 border border-red-500 text-red-400 rounded hover:bg-red-500/10 transition-colors text-sm font-semibold"
              >
                Limpar Filtros
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-[#9400FF] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors disabled:opacity-50 text-sm font-semibold"
            >
              {isLoading ? 'Buscando...' : 'Aplicar Filtros'}
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500">Filtros ativos:</span>
          {filters.query && (
            <div className="px-2 py-1 rounded bg-[#9400FF]/20 border border-[#9400FF] text-[#9400FF] text-xs flex items-center gap-2">
              <span>"{filters.query}"</span>
            </div>
          )}
          {filters.tags.map(tag => (
            <div key={tag} className="px-2 py-1 rounded bg-[#9400FF]/20 border border-[#9400FF] text-[#9400FF] text-xs">
              ${tag}
            </div>
          ))}
          {filters.moods.map(mood => {
            const moodObj = MOODS.find(m => m.id === mood);
            return (
              <div key={mood} className="px-2 py-1 rounded bg-[#9400FF]/20 border border-[#9400FF] text-[#9400FF] text-xs">
                {moodObj?.label.split(' ')[1]}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
