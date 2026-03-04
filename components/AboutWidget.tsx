'use client';

import React, { useState } from 'react';
import { Terminal, Edit3 } from 'lucide-react';
import BioEditModal from './BioEditModal';

interface AboutWidgetProps {
  bio?: string;
  onBioUpdate?: (newBio: string) => void;
}

const DEFAULT_BIO = 'Welcome to my personal diary. This is where I document my life, thoughts, and daily experiences in a retro-styled digital space.';

export default function AboutWidget({ bio = DEFAULT_BIO, onBioUpdate }: AboutWidgetProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentBio, setCurrentBio] = useState(bio);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveBio = async (newBio: string) => {
    setIsSaving(true);
    try {
      // TODO: Integrar com API para salvar bio no banco de dados
      // await fetch('/api/user/bio', { method: 'PUT', body: JSON.stringify({ bio: newBio }) })
      
      setCurrentBio(newBio);
      onBioUpdate?.(newBio);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar bio:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] p-5 rounded-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[var(--theme-text-light)] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[var(--theme-primary)]" />
            About Me
          </h3>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-1.5 text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)] hover:bg-[var(--theme-primary)]/10 rounded transition-colors"
            title="Editar bio (clique para abrir editor)"
            aria-label="Editar bio"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-[var(--theme-text-secondary)] leading-relaxed">
          {currentBio}
        </p>
      </div>

      <BioEditModal
        isOpen={isEditModalOpen}
        currentBio={currentBio}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveBio}
        isSaving={isSaving}
      />
    </>
  );
}
