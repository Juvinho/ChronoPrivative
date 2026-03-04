"use client";

import { useState, useRef, useEffect } from "react";

interface TerminalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

export function TerminalInput({ value, className, ...props }: TerminalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <input
        ref={inputRef}
        value={value}
        className="terminal-input w-full bg-transparent border-none outline-none text-inherit font-inherit p-0 m-0 h-full"
        {...props}
      />
    </div>
  );
}
