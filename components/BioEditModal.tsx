'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface BioEditModalProps {
  isOpen: boolean;
  currentBio: string;
  onClose: () => void;
  onSave: (newBio: string) => void;
  isSaving?: boolean;
  onError?: (error: string) => void;
}

export default function BioEditModal({
  isOpen,
  currentBio,
  onClose,
  onSave,
  isSaving = false,
  onError,
}: BioEditModalProps) {
  const [bio, setBio] = useState(currentBio);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setBio(currentBio);
    setError(null);
    setSuccess(false);
  }, [isOpen, currentBio]);

  const handleSave = () => {
    if (!bio.trim()) {
      setError('Bio não pode estar vazia');
      return;
    }

    if (bio.length > 500) {
      setError('Bio não pode exceder 500 caracteres');
      return;
    }

    onSave(bio);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-[var(--theme-bg-secondary)] border-2 border-[var(--theme-primary)] rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in scale-in-95 duration-300 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[var(--theme-bg-secondary)] border-b border-[var(--theme-primary)] p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--theme-primary)]">📝 EDITAR BIO</h2>
          <button
            onClick={onClose}
            className="p-1 text-[var(--theme-primary)] hover:text-[var(--theme-accent)] hover:bg-[var(--theme-primary)]/10 rounded transition-colors"
            title="Fechar (Esc)"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
        {/* Error/Success Message */}
        {error && (
          <div className="p-3 rounded border-l-4 border-red-500 bg-red-500/10 text-red-400 flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 rounded border-l-4 border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] flex items-center gap-2 animate-in fade-in">
            <CheckCircle size={18} />
            <span>Bio atualizada com sucesso!</span>
          </div>
        )}

          {/* Bio Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--theme-text-light)]">
              Sua Bio
            </label>
            <textarea
              value={bio}
              onChange={e => {
                setBio(e.target.value);
                setError(null);
              }}
              onKeyDown={e => {
                if (e.key === 'Escape') onClose();
              }}
              placeholder="Escreva algo sobre você..."
              className="w-full h-32 px-3 py-2 bg-[var(--theme-bg-primary)] border border-[var(--theme-primary)] rounded text-[var(--theme-text-light)] placeholder-gray-600 focus:border-[var(--theme-accent)] focus:outline-none transition-colors resize-none"
            />
            <div className="flex justify-between text-xs text-[var(--theme-text-secondary)]">
              <span>Máximo 500 caracteres</span>
              <span>{bio.length}/500</span>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--theme-text-light)]">
              Pré-visualização
            </label>
            <div className="p-3 bg-[var(--theme-bg-primary)] border border-[var(--theme-border-primary)] rounded text-sm text-[var(--theme-text-secondary)] min-h-16 leading-relaxed whitespace-pre-wrap">
              {bio || '(sua bio aparecerá aqui)'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[var(--theme-bg-secondary)] border-t border-[var(--theme-primary)] p-4 flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-[var(--theme-primary)] text-[var(--theme-primary)] rounded hover:bg-[var(--theme-primary)]/10 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] transition-colors disabled:opacity-50 font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded hover:bg-[var(--theme-accent)] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
          >
            <Save size={18} />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
