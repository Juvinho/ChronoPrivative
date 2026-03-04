import React from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
}

export function HighlightText({ text, query }: HighlightTextProps) {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  if (keywords.length === 0) {
    return <>{text}</>;
  }

  // Create a regex that matches any of the keywords
  // Escape keywords for regex
  const escapedKeywords = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = keywords.some(k => part.toLowerCase() === k);
        return isMatch ? (
          <mark key={i} className="bg-[var(--theme-primary)] text-white px-1 rounded-sm">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}
