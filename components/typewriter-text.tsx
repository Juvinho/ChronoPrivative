"use client";

import { useState, useEffect, useRef, memo } from "react";
import Markdown from "react-markdown";

const MemoizedMarkdown = memo(({ text }: { text: string }) => (
  <Markdown>{text}</Markdown>
));
MemoizedMarkdown.displayName = "MemoizedMarkdown";

export function TypewriterText({ text, speed = 15 }: { text: string; speed?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Trigger typing when component scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Allow skipping with any key press
  useEffect(() => {
    if (!isTyping || isSkipped || typeof window === 'undefined') return;
    
    const handleKeyDown = () => {
      setIsSkipped(true);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, isSkipped]);

  useEffect(() => {
    if (!isVisible || isSkipped || !containerRef.current) {
      if (isSkipped) setIsTyping(false);
      return;
    }

    if (initialized.current) return;
    initialized.current = true;

    const container = containerRef.current;
    
    // 1. Wrap all text characters in spans
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.trim().length > 0) {
        textNodes.push(n as Text);
      }
    }

    const spans: HTMLSpanElement[] = [];
    textNodes.forEach(textNode => {
      const textContent = textNode.nodeValue || '';
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < textContent.length; i++) {
        const span = document.createElement('span');
        span.textContent = textContent[i];
        if (textContent[i] === ' ') {
          span.style.whiteSpace = 'pre-wrap';
        }
        span.style.opacity = '0';
        fragment.appendChild(span);
        spans.push(span);
      }
      textNode.parentNode?.replaceChild(fragment, textNode);
    });

    // 2. Reveal spans sequentially with variable speed
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;
    
    // Authentic terminal block cursor
    const cursor = document.createElement('span');
    cursor.className = 'inline-block w-[0.6em] h-[1.1em] bg-[var(--theme-primary)] animate-[blink_1s_step-end_infinite] ml-0.5 align-text-bottom opacity-80';
    
    const typeNext = () => {
      const remaining = spans.length - currentIndex;
      
      // Dynamic chunk size: faster for longer texts so it doesn't take forever
      // Max duration ~ 2.5 seconds for very long posts
      const baseChars = Math.max(1, Math.ceil(spans.length / 150)); 
      
      // Add slight randomness to chunk size for a "streaming network" feel
      const charsThisTick = Math.min(remaining, baseChars + Math.floor(Math.random() * 3));
      
      for (let i = 0; i < charsThisTick; i++) {
        const span = spans[currentIndex];
        span.style.opacity = '1';
        
        // Only move cursor to the last character of this chunk to save DOM operations
        if (i === charsThisTick - 1) {
          span.parentNode?.insertBefore(cursor, span.nextSibling);
        }
        currentIndex++;
      }

      if (currentIndex < spans.length) {
        // Randomize delay slightly (e.g., speed to speed + 15ms)
        const delay = speed + Math.random() * 15;
        timeoutId = setTimeout(typeNext, delay);
      } else {
        setIsTyping(false);
        if (cursor.parentNode) {
          cursor.parentNode.removeChild(cursor);
        }
      }
    };

    timeoutId = setTimeout(typeNext, speed);

    return () => {
      clearTimeout(timeoutId);
      if (cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }
    };
  }, [isVisible, isSkipped, speed]);

  return (
    <div 
      onClick={() => setIsSkipped(true)}
      className={isTyping ? "cursor-pointer group relative" : "relative"}
    >
      <div className="markdown-body" ref={containerRef}>
        <MemoizedMarkdown key={isSkipped ? 'skipped' : 'typing'} text={text} />
      </div>
      {isTyping && (
        <div className="mt-4 flex items-center">
          <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity text-[var(--theme-primary)] font-mono tracking-widest animate-pulse">
            [PRESS ANY KEY OR CLICK TO SKIP]
          </span>
        </div>
      )}
    </div>
  );
}

