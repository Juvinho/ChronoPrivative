'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface DarkModeToggleProps {
  onToggle?: (isDark: boolean) => void;
}

export default function DarkModeToggle({ onToggle }: DarkModeToggleProps) {
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  const handleToggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark);
    onToggle?.(newIsDark);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded border border-[#9400FF] text-[#9400FF] hover:border-[#00FF00] hover:text-[#00FF00] hover:bg-[#9400FF]/10 transition-all duration-300"
      title={isDark ? 'Modo claro (d)' : 'Modo escuro (d)'}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
