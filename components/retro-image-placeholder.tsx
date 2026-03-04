import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface RetroImagePlaceholderProps {
  text?: string;
  altText?: string;
  src?: string;
  className?: string;
  onClick?: () => void;
}

export function RetroImagePlaceholder({ 
  text = "IMG_NOT_FOUND", 
  altText,
  src,
  className = "w-full h-48",
  onClick
}: RetroImagePlaceholderProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use provided src or a picsum fallback based on text seed
  const imageSrc = src || `https://picsum.photos/seed/${text}/800/600`;

  return (
    <div 
      className={`relative flex flex-col items-center justify-center bg-[#020005] border-2 border-[var(--theme-border-primary)] overflow-hidden shadow-[inset_0_0_20px_rgba(148,0,255,0.1)] group ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {/* Actual Image */}
      {!error && (
        <div className="absolute inset-0 z-0">
          <Image 
            src={imageSrc} 
            alt={altText || text} 
            fill 
            className={`object-cover transition-all duration-700 ${
              loading ? "opacity-0 scale-110" : "opacity-90 grayscale-[50%] group-hover:grayscale-0 group-hover:opacity-100 scale-100"
            }`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Loading Spinner */}
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
          <div className="w-6 h-6 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Content Overlay (Visible if image fails, loading, or on hover as a subtle label) */}
      <div className={`relative z-20 flex flex-col items-center gap-3 text-[var(--theme-primary)] bg-black/60 backdrop-blur-[4px] px-4 py-2 rounded-sm border border-[var(--theme-primary)]/30 transition-all duration-300 ${
        !loading && !error ? "group-hover:opacity-0 opacity-100" : "opacity-100"
      }`}>
        <ImageIcon className={`w-5 h-5 ${loading ? "animate-bounce" : "animate-pulse"}`} />
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest font-bold">
          <span className="text-[var(--theme-text-secondary)]">{'<'}</span>
          <span className="glitch-effect" data-text={error ? "ERR_LOAD_FAIL" : text}>{error ? "ERR_LOAD_FAIL" : text}</span>
          <span className="text-[var(--theme-text-secondary)]">{'>'}</span>
        </div>
      </div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-30 z-10"></div>
      
      {/* Screen glare */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50 z-10"></div>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--theme-primary)] z-20"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[var(--theme-primary)] z-20"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[var(--theme-primary)] z-20"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--theme-primary)] z-20"></div>
    </div>
  );
}
