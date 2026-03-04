"use client";

import { useState, useEffect, useRef } from "react";
import { ShieldAlert } from "lucide-react";

export function LoginScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const lines = [
      "CHRONO_OS v9.9.4 BOOT SEQUENCE INITIATED...",
      "LOADING KERNEL MODULES... [OK]",
      "MOUNTING ENCRYPTED FILESYSTEM... [OK]",
      "ESTABLISHING SECURE CONNECTION... [OK]",
      "WARNING: UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED.",
      "PLEASE IDENTIFY YOURSELF."
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setBootSequence((prev) => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        setShowInput(true);
        clearInterval(interval);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Senhas aceitas: "admin" ou "juan"
    if (password === "admin" || password === "juan") {
      setError(false);
      setAccessGranted(true);
      setBootSequence((prev) => [...prev, "> " + password.replace(/./g, '*'), "ACCESS GRANTED. DECRYPTING DIARY..."]);

      // Obter JWT do backend (best-effort — UI desbloqueia independente)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: password }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }
        })
        .catch(() => { /* backend indisponível — continua sem token */ });

      setTimeout(() => {
        onUnlock();
      }, 1500);
    } else {
      setError(true);
      setBootSequence((prev) => [...prev, "> " + password.replace(/./g, '*'), "ACCESS DENIED. INCORRECT PASSWORD."]);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-mono text-[var(--theme-primary)] selection:bg-[var(--theme-primary)] selection:text-black">
      <div className="max-w-2xl w-full animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <ShieldAlert className={`w-16 h-16 mb-4 ${accessGranted ? 'text-green-500' : error ? 'text-red-500' : 'text-[var(--theme-primary)] animate-pulse'}`} />
          <h1 className="text-2xl font-bold tracking-[0.3em] text-center">
            PRIVATE DIARY ACCESS
          </h1>
        </div>

        <div className="bg-black/80 border border-[var(--theme-border-primary)] p-6 rounded-sm shadow-[0_0_30px_rgba(0,255,0,0.1)] min-h-[350px] flex flex-col relative overflow-hidden">
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
          
          <div className="flex-1 space-y-2 mb-4 relative z-20">
            {bootSequence.map((line, i) => (
              <div key={i} className={`${line?.includes('DENIED') ? 'text-red-500' : line?.includes('GRANTED') ? 'text-green-500' : 'text-[var(--theme-text-secondary)]'}`}>
                {line}
              </div>
            ))}
          </div>

          {showInput && !accessGranted && (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-auto relative z-20">
              <span className="text-[var(--theme-primary)] font-bold">root@chrono:~#</span>
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-[var(--theme-primary)] tracking-widest caret-[var(--theme-primary)]"
                autoFocus
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
