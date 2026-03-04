'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, Edit3, AlertCircle } from 'lucide-react';
import BioEditModal from './BioEditModal';

interface AboutWidgetProps {
  bio?: string;
  token?: string;
  onBioUpdate?: (newBio: string) => void;
}

const DEFAULT_BIO = 'Welcome to my personal diary. This is where I document my life, thoughts, and daily experiences in a retro-styled digital space.';

export default function AboutWidget({ bio = DEFAULT_BIO, token, onBioUpdate }: AboutWidgetProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentBio, setCurrentBio] = useState(bio);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca a bio atual do servidor na montagem do componente
  // Garante que após um reload a bio persistida no banco seja exibida
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/user/bio`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.bio) {
          setCurrentBio(data.data.bio);
          onBioUpdate?.(data.data.bio);
        }
      })
      .catch(() => {
        // Silencioso: mantém o valor do prop em caso de erro de rede
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveBio = async (newBio: string) => {
    setIsSaving(true);
    setError(null);

    try {
      // token prop pode ser null por race condition no login (JWT ainda não armazenado
      // quando onUnlock dispara). Lê localStorage como fallback garantido.
      const effectiveToken = token ?? (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

      if (!effectiveToken) {
        throw new Error('Token de autenticação não disponível. Faça login novamente.');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/user/bio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`,
        },
        body: JSON.stringify({ bio: newBio }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar bio');
      }

      const data = await response.json();
      setCurrentBio(data.data.bio);
      onBioUpdate?.(data.data.bio);
      setIsEditModalOpen(false);

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao salvar bio';
      setError(errorMessage);
      console.error('Erro ao salvar bio:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] p-5 rounded-sm">
        {/* Error Message */}
        {error && (
          <div className="p-3 rounded border-l-4 border-red-500 bg-red-500/10 text-red-400 flex items-center gap-2 mb-3 animate-in fade-in">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[var(--theme-text-light)] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[var(--theme-primary)]" />
            About Me
          </h3>
          <button
            onClick={() => setIsEditModalOpen(true)}
            disabled={isSaving}
            className="inline-flex items-center text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Editar bio (clique para abrir editor)"
            aria-label="Editar bio"
          >
            <Edit3 className="w-4 h-4 flex-shrink-0 group-hover:rotate-12 transition-transform" />
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
