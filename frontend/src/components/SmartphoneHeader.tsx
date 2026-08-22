import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Definição dos tipos das propriedades que o cabeçalho vai aceitar
interface MobileHeaderProps {
  title: string;       // O texto que vai aparecer no centro
  backToUrl: string;   // A rota para onde o botão voltar vai levar (ex: "/dashboard")
}

export default function SmartphoneHeader({ title, backToUrl }: MobileHeaderProps) {
  return (
    <header className="flex items-center mb-6 w-full">
      {/* Botão de voltar envelopado com o Link do Next.js */}
      <Link 
        href={backToUrl}
        className="p-2 -ml-2 text-slate-800 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Voltar para a página anterior"
      >
        <ArrowLeft className="w-6 h-6 stroke-2" />
      </Link>
      
      {/* Título dinâmico da tela */}
      <h1 className="text-xl font-bold text-slate-800 flex-1 text-center pr-10">
        {title}
      </h1>
    </header>
  );
}
