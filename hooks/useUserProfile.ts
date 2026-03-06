'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface UserProfile {
  username: string;
  avatarUrl: string | null;
}

export function useUserProfile(token: string | null) {
  const [profile, setProfile] = useState<UserProfile>({ username: '', avatarUrl: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/profile`);
      const data = await res.json();
      if (data.success) setProfile(data.data);
    } catch {
      // silencioso — mantém estado anterior
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateUsername = useCallback(
    async (newUsername: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const effectiveToken = token ?? localStorage.getItem('auth_token');
        const res = await fetch(`${API_URL}/api/user/username`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveToken}`,
          },
          body: JSON.stringify({ username: newUsername }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao atualizar username.');
        setProfile((prev) => ({ ...prev, username: data.data.username }));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const uploadAvatar = useCallback(
    async (file: File): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const effectiveToken = token ?? localStorage.getItem('auth_token');
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await fetch(`${API_URL}/api/user/avatar`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${effectiveToken}` },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao enviar avatar.');
        setProfile((prev) => ({ ...prev, avatarUrl: data.data.avatarUrl }));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  return { profile, isLoading, error, fetchProfile, updateUsername, uploadAvatar };
}
