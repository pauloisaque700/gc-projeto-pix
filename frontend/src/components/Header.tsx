import React from 'react';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
}

export default function Header({ title = "Minhas Contas Bancárias", onBack }: HeaderProps) {
  return (
    <header className="w-full max-w-[375px] mx-auto bg-white px-6 py-4 flex items-center select-none border-b border-gray-50">
      {/* Botão de Voltar */}
      <button 
        onClick={onBack}
        className="mr-4 p-1 -ml-1 text-gray-900 active:scale-95 transition-transform"
        aria-label="Voltar"
      >
        <svg 
          xmlns="http://w3.org" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      {/* Título da Página */}
      <h1 className="text-gray-900 font-bold text-[17px] tracking-tight">
        {title}
      </h1>
    </header>
  );
}
