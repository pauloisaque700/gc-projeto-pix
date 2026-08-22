import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  bgClass?: string;     // Fundo customizado (padrão: bg-white)
  borderClass?: string; // Borda customizada (padrão: border-slate-100)
  paddingClass?: string;// Espaçamento interno (padrão: p-5)
  roundedClass?: string;// Arredondamento dos cantos (padrão: rounded-3xl)
}

export default function Card({ 
  children, 
  bgClass = 'bg-white', 
  borderClass = 'border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
  paddingClass = 'p-5',
  roundedClass = 'rounded-3xl'
}: CardProps) {
  return (
    <div className={`w-full max-w-[400px] flex flex-col gap-5 font-sans transition-all
      ${bgClass} 
      ${borderClass} 
      ${paddingClass} 
      ${roundedClass}`}
    >
      {children}
    </div>
  );
}
