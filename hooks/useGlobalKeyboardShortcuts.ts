'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutHandlers {
  onNewPost?: () => void;
  onEditPost?: () => void;
  onDeletePost?: () => void;
  onSearch?: () => void;
  onPreviousPost?: () => void;
  onNextPost?: () => void;
  onRandomPost?: () => void;
  onToggleDarkMode?: () => void;
  onShowHelp?: () => void;
  onFavorite?: () => void;
  onAddTag?: () => void;
  onGoHome?: () => void;
  onGoEnd?: () => void;
}

export function useGlobalKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      const isContentEditable = target.contentEditable === 'true';

      if (isInput && !isCtrlOrCmd(event)) {
        return;
      }

      const key = event.key.toLowerCase();
      const ctrl = isCtrlOrCmd(event);
      const shift = event.shiftKey;

      // Navigation shortcuts
      if (key === 'j') {
        event.preventDefault();
        handlers.onPreviousPost?.();
      } else if (key === 'k') {
        event.preventDefault();
        handlers.onNextPost?.();
      } else if (key === '/') {
        event.preventDefault();
        handlers.onSearch?.();
      } else if (key === 'home') {
        event.preventDefault();
        handlers.onGoHome?.();
      } else if (key === 'end') {
        event.preventDefault();
        handlers.onGoEnd?.();
      }
      // Editing shortcuts
      else if (key === 'n' && !isInput) {
        event.preventDefault();
        handlers.onNewPost?.();
      } else if (key === 'e' && !isInput) {
        event.preventDefault();
        handlers.onEditPost?.();
      } else if (key === 'x' && !isInput) {
        event.preventDefault();
        handlers.onDeletePost?.();
      } else if (key === 's' && ctrl) {
        event.preventDefault();
        handlers.onEditPost?.(); // Save is same as edit in form context
      }
      // Action shortcuts
      else if (key === 'f' && !isInput) {
        event.preventDefault();
        handlers.onFavorite?.();
      } else if (key === 'r' && !isInput) {
        event.preventDefault();
        handlers.onRandomPost?.();
      } else if (key === 't' && !isInput) {
        event.preventDefault();
        handlers.onAddTag?.();
      }
      // Interface shortcuts
      else if (key === 'd' && !isInput) {
        event.preventDefault();
        handlers.onToggleDarkMode?.();
      } else if (key === '?') {
        event.preventDefault();
        handlers.onShowHelp?.();
      } else if (key === 'escape') {
        event.preventDefault();
        // Escape is handled globally to close modals
      }
    },
    [handlers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}

function isCtrlOrCmd(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}
