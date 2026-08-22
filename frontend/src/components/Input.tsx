import { ReactNode } from 'react';

interface InputProps {
  label: string;
  placeholder: string;
  icon: ReactNode; // Aceita o ícone do Lucide montado (ex: <Mail />)
  type?: string;   // Tipo do input (ex: "text", "tel")
}

export default function Input({
  label,
  placeholder,
  icon,
  type = 'text',
}: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full font-sans">
      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      
      <div className="relative flex items-center">
        {/* Ícone posicionado perfeitamente à esquerda */}
        <div className="absolute left-4 text-slate-400 flex items-center justify-center">
          {icon}
        </div>
        
        <input
          type={type}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-[#4F46E5] text-slate-800 transition-colors"
        />
      </div>
    </div>
  );
}
