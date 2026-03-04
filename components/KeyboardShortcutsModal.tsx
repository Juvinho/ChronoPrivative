'use client';

import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { category: 'Navegação', key: 'j', description: 'Post anterior (cima)' },
  { category: 'Navegação', key: 'k', description: 'Próximo post (baixo)' },
  { category: 'Navegação', key: '/', description: 'Focar busca' },
  { category: 'Navegação', key: 'Home', description: 'Topo da página' },
  { category: 'Navegação', key: 'End', description: 'Fim da página' },
  
  // Editing
  { category: 'Edição', key: 'n', description: 'Novo post' },
  { category: 'Edição', key: 'e', description: 'Editar post selecionado' },
  { category: 'Edição', key: 'Ctrl + S', description: 'Salvar (em formulários)' },
  { category: 'Edição', key: 'x', description: 'Deletar post' },
  
  // Actions
  { category: 'Ações', key: 'f', description: 'Favoritar / Like' },
  { category: 'Ações', key: 'r', description: 'Post aleatório' },
  { category: 'Ações', key: 'c', description: 'Copiar URL' },
  { category: 'Ações', key: 't', description: 'Adicionar tag' },
  
  // Interface
  { category: 'Interface', key: '?', description: 'Mostrar atalhos (esta modal)' },
  { category: 'Interface', key: 'd', description: 'Alternar modo escuro' },
  { category: 'Interface', key: 'Esc', description: 'Fechar modais / Desfocar' },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category)));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#0A0015] border-2 border-[#9400FF] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in scale-in-95 duration-300 shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0015] border-b border-[#9400FF] p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HelpCircle size={24} className="text-[#9400FF]" />
            <h2 className="text-xl font-bold text-[#9400FF]">ATALHOS TECLADO</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9400FF] hover:text-[#00FF00] hover:bg-[#9400FF]/10 rounded transition-colors"
            title="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {categories.map(category => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-bold text-[#00FF00] border-b border-[#9400FF]/30 pb-2">
                {category}
              </h3>
              <div className="grid gap-2">
                {SHORTCUTS.filter(s => s.category === category).map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-[#1A0B2E] border border-[#9400FF]/30 rounded hover:border-[#00FF00] transition-colors"
                  >
                    <span className="text-gray-300">{shortcut.description}</span>
                    <kbd className="px-3 py-1 bg-[#9400FF] text-white rounded font-mono text-sm border border-[#00FF00]/50 font-semibold">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Tips */}
          <div className="mt-8 p-4 bg-[#9400FF]/10 border border-[#9400FF]/30 rounded-lg">
            <h4 className="font-bold text-[#00FF00] mb-2">💡 DICAS</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Use <kbd className="bg-[#1A0B2E] px-1 rounded">Tab</kbd> para navegar entre elementos</li>
              <li>• Muitos inputs suportam <kbd className="bg-[#1A0B2E] px-1 rounded">Enter</kbd> para confirmar</li>
              <li>• Pressione <kbd className="bg-[#1A0B2E] px-1 rounded">?</kbd> a qualquer momento para abrir este menu</li>
              <li>• Os atalhos funcionam globalmente em toda a aplicação</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0A0015] border-t border-[#9400FF] p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#9400FF] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors font-semibold"
          >
            Fechar (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
