"use client";

import { forwardRef } from "react";

interface TerminalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

export const TerminalTextarea = forwardRef<HTMLTextAreaElement, TerminalTextareaProps>(
  ({ value, className, ...props }, ref) => {
    return (
      <div className={`relative w-full ${className}`}>
        <textarea
          ref={ref}
          value={value}
          className="terminal-input w-full bg-transparent border-none outline-none text-inherit font-inherit p-0 m-0 h-full resize-none"
          {...props}
        />
      </div>
    );
  }
);

TerminalTextarea.displayName = "TerminalTextarea";
