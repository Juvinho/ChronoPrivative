'use client';

import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

interface Topic {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface TopicsWidgetProps {
  topics?: Topic[];
  onTopicSelect?: (topic: string) => void;
}

const DEFAULT_TOPICS: Topic[] = [
  { id: 1, name: 'LIFE', slug: 'life', count: 0 },
  { id: 2, name: 'THOUGHTS', slug: 'thoughts', count: 0 },
  { id: 3, name: 'TRAVEL', slug: 'travel', count: 0 },
  { id: 4, name: 'MUSIC', slug: 'music', count: 0 },
  { id: 5, name: 'RANDOM', slug: 'random', count: 0 },
];

export default function TopicsWidget({
  topics: propTopics,
  onTopicSelect,
}: TopicsWidgetProps) {
  const [topics, setTopics] = useState<Topic[]>(propTopics || DEFAULT_TOPICS);
  const [loading, setLoading] = useState(!propTopics);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propTopics) {
      setTopics(propTopics);
      return;
    }

    const fetchTopics = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/user/topics`);
        
        if (!response.ok) {
          console.error(`Erro HTTP ao carregar tópicos: ${response.status} ${response.statusText}`);
          const errorMessage = response.status === 404 
            ? 'Endpoint de tópicos não encontrado (verifique a configuração da API)'
            : response.status === 401
            ? 'Não autorizado - faça login novamente'
            : response.status >= 500
            ? 'Servidor indisponível - tente novamente em instantes'
            : 'Erro ao carregar tópicos';
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setTopics(data.data || DEFAULT_TOPICS);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar tópicos';
        console.error('Erro ao carregar tópicos:', errorMessage, err);
        setTopics(DEFAULT_TOPICS);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [propTopics]);
  return (
    <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] p-5 rounded-sm">
      <h3 className="font-bold text-[var(--theme-text-light)] mb-3 flex items-center gap-2">
        <Lock className="w-4 h-4 text-[var(--theme-primary)]" />
        Topics
      </h3>

      {error && (
        <div className="p-2 rounded border-l-4 border-red-500 bg-red-500/10 text-red-400 flex items-center gap-2 mb-3 text-xs">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-xs text-[var(--theme-text-secondary)] animate-pulse">
          Carregando tópicos...
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onTopicSelect?.(topic.slug)}
              className="text-xs bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] px-2 py-1 rounded text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)] cursor-pointer transition-colors disabled:opacity-50"
              title={`Filtrar por ${topic.name}`}
            >
              ${topic.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
