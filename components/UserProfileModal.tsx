'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, Camera, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  avatarUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onUpdateUsername: (newUsername: string) => Promise<boolean>;
  onUploadAvatar: (file: File) => Promise<boolean>;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  username,
  avatarUrl,
  isLoading,
  error,
  onUpdateUsername,
  onUploadAvatar,
}: UserProfileModalProps) {
  const [newUsername, setNewUsername] = useState(username);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza estado quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setNewUsername(username);
      setPreview(avatarUrl);
      setPendingFile(null);
      setUsernameSuccess(false);
      setAvatarSuccess(false);
      setLocalError(null);
    }
  }, [isOpen, username, avatarUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setLocalError('Imagem muito grande. Máximo 2MB.');
      return;
    }

    setLocalError(null);
    setPendingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!pendingFile) return;
    setLocalError(null);
    const ok = await onUploadAvatar(pendingFile);
    if (ok) {
      setPendingFile(null);
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3000);
    }
  };

  const handleSaveUsername = async () => {
    const trimmed = newUsername.trim();
    if (!trimmed || trimmed.length < 3) {
      setLocalError('Username deve ter no mínimo 3 caracteres.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setLocalError('Username só pode conter letras, números e _ (underscore).');
      return;
    }
    setLocalError(null);
    const ok = await onUpdateUsername(trimmed);
    if (ok) {
      setUsernameSuccess(true);
      setTimeout(() => setUsernameSuccess(false), 3000);
    }
  };

  if (!isOpen) return null;

  const displayError = localError ?? error;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="bg-[var(--theme-bg-secondary)] border-2 border-[var(--theme-primary)] rounded-sm w-full max-w-md shadow-[0_0_40px_rgba(138,43,226,0.25)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--theme-primary)]/40">
          <h2 className="text-sm font-bold tracking-widest text-[var(--theme-primary)] uppercase flex items-center gap-2">
            <User className="w-4 h-4" />
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-7">
          {/* Error / Success banners */}
          {displayError && (
            <div className="flex items-center gap-2 border-l-4 border-red-500 bg-red-500/10 text-red-400 px-3 py-2 rounded-r text-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {displayError}
            </div>
          )}
          {(usernameSuccess || avatarSuccess) && (
            <div className="flex items-center gap-2 border-l-4 border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] px-3 py-2 rounded-r text-sm animate-in fade-in">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {avatarSuccess ? 'Avatar atualizado!' : 'Username salvo!'}
            </div>
          )}

          {/* ── Avatar ── */}
          <section className="space-y-3">
            <label className="block text-xs font-bold tracking-widest text-[var(--theme-text-secondary)] uppercase">
              Foto de Perfil
            </label>

            <div className="flex items-center gap-5">
              {/* Circle preview */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-20 h-20 rounded-full border-2 border-[var(--theme-primary)] overflow-hidden bg-[var(--theme-bg-tertiary)] flex items-center justify-center group hover:border-[var(--theme-secondary)] transition-colors flex-shrink-0"
                title="Clique para escolher imagem"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-[var(--theme-text-secondary)]" />
                )}
                <span className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </span>
              </button>

              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-sm border border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 py-2 px-3 rounded-sm transition-colors font-mono tracking-wider"
                >
                  Escolher Imagem
                </button>
                <p className="text-[10px] text-[var(--theme-text-secondary)] text-center">
                  JPG · PNG · GIF · WEBP · máx 2MB
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {pendingFile && (
              <button
                onClick={handleSaveAvatar}
                disabled={isLoading}
                className="w-full bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white text-sm font-bold py-2 px-4 rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isLoading ? 'Salvando...' : 'Salvar Avatar'}
              </button>
            )}
          </section>

          {/* Divider */}
          <div className="border-t border-[var(--theme-border-primary)]" />

          {/* ── Username ── */}
          <section className="space-y-3">
            <label
              htmlFor="profile-username"
              className="block text-xs font-bold tracking-widest text-[var(--theme-text-secondary)] uppercase"
            >
              Username
            </label>
            <div className="flex gap-2">
              <input
                id="profile-username"
                type="text"
                value={newUsername}
                onChange={(e) => {
                  setNewUsername(e.target.value);
                  setLocalError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveUsername();
                  if (e.key === 'Escape') onClose();
                }}
                maxLength={30}
                placeholder="seu_username"
                className="flex-1 bg-[var(--theme-bg-primary)] border border-[var(--theme-primary)] text-[var(--theme-text-primary)] px-3 py-2 rounded-sm text-sm placeholder-[var(--theme-text-secondary)]/50 focus:outline-none focus:border-[var(--theme-secondary)] transition-colors font-mono"
              />
              <button
                onClick={handleSaveUsername}
                disabled={isLoading || newUsername.trim() === username}
                className="bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white px-4 py-2 rounded-sm text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar
              </button>
            </div>
            <p className="text-[10px] text-[var(--theme-text-secondary)]">
              3–30 caracteres · letras, números e _ (Enter para salvar)
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
