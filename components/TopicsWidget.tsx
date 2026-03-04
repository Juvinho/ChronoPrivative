'use client';

import React from 'react';
import { Lock } from 'lucide-react';

interface TopicsWidgetProps {
  topics?: string[];
  onTopicSelect?: (topic: string) => void;
}

const DEFAULT_TOPICS = ['LIFE', 'THOUGHTS', 'TRAVEL', 'MUSIC', 'RANDOM'];

export default function TopicsWidget({
  topics = DEFAULT_TOPICS,
  onTopicSelect,
}: TopicsWidgetProps) {
  return (
    <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] p-5 rounded-sm">
      <h3 className="font-bold text-[var(--theme-text-light)] mb-3 flex items-center gap-2">
        <Lock className="w-4 h-4 text-[var(--theme-primary)]" />
        Topics
      </h3>
      <div className="flex flex-wrap gap-2">
        {/* TODO: Integrar com API para carregar tópicos dinâmicos do banco de dados */}
        {/* await fetch('/api/topics') para obter lista dinâmica */}
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => onTopicSelect?.(topic)}
            className="text-xs bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] px-2 py-1 rounded text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)] cursor-pointer transition-colors"
            title={`Filtrar por ${topic}`}
          >
            ${topic}
          </button>
        ))}
      </div>
    </div>
  );
}
