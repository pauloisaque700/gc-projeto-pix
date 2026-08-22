import { ReactNode } from 'react';

interface ButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  icon?: ReactNode;             // Ícone opcional (ex: <Plus />, ou omitido)
  bgClass?: string;             // Classe do Tailwind para o fundo (ex: "bg-red-50/50")
  borderClass?: string;         // Classe do Tailwind para a borda (ex: "border border-red-200")
  textClass?: string;           // Classe do Tailwind para o texto (ex: "text-red-600")
  widthClass?: string;          // Classe de tamanho de largura (padrão: "w-full")
}

export default function BotaoGrande({
  text,
  onClick,
  disabled = false,
  isLoading = false,
  icon,
  bgClass = 'bg-[#4F46E5] hover:bg-[#4338CA]', // Padrão roxo
  borderClass = 'border border-transparent',    // Padrão sem borda visível
  textClass = 'text-white font-medium',          // Padrão texto branco
  widthClass = 'w-full',                        // Padrão largura cheia
}: ButtonProps) {
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`py-4 rounded-xl text-sm transition-colors mt-2 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5]
        ${widthClass}
        ${bgClass}
        ${borderClass}
        ${textClass}
        ${(disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Carregando...</span>
        </>
      ) : (
        <>
          {/* Só renderiza se houver um ícone passado via props */}
          {icon && <span className="flex items-center justify-center">{icon}</span>}
          <span>{text}</span>
        </>
      )}
    </button>
  );
}
