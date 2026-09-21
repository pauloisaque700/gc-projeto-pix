import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

// Tipagem das propriedades para personalização completa
interface CardTransferenciasProps {
  title: string;          // Ex: "PIX enviado"
  description: string;    // Ex: "Maria Silva"
  amount: number;         // Valor numérico (positivo para entrada, negativo para saída)
  date: string;           // Ex: "Hoje", "Ontem" ou "20/08"
  type?: 'income' | 'outcome'; // Força a direção se necessário, se não o sinal do amount define
}

export default function CardTransferencias({
  title,
  description,
  amount,
  date,
  type,
}: CardTransferenciasProps) {
  // Define se é uma entrada ou saída com base no valor ou propriedade estrita
  const isNegative = type ? type === 'outcome' : amount < 0;

  // Formata o valor monetário de forma limpa para o padrão brasileiro
  const formatarValor = (valor: number) => {
    const formatado = Math.abs(valor).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${isNegative ? '-' : '+'} R$ ${formatado}`;
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-200 last:border-b-0 w-full bg-white">
      
      {/* Lado Esquerdo: Ícone e Informações textuais */}
      <div className="flex items-center gap-3">
        {/* Círculo do Ícone Dinâmico - Cores de fundo e bordas intensificadas */}
        <div 
          className={`w-11 h-11 rounded-full flex items-center justify-center border transition-colors ${
            isNegative 
              ? 'bg-red-100 border-red-200' 
              : 'bg-emerald-100 border-emerald-200'
          }`}
        >
          {isNegative ? (
            <ArrowUpRight className="w-5 h-5 text-red-600 stroke-[3]" />
          ) : (
            <ArrowDownLeft className="w-5 h-5 text-emerald-600 stroke-[3]" />
          )}
        </div>

        {/* Textos Principais - Tons de cinza e preto bem profundos */}
        <div className="flex flex-col text-left">
          <span className="text-sm font-black text-slate-900 leading-tight">
            {title}
          </span>
          <span className="text-xs text-slate-600 font-medium mt-0.5">
            {description}
          </span>
        </div>
      </div>

      {/* Lado Direito: Valor e Data */}
      <div className="flex flex-col items-end text-right">
        {/* Valor - Vermelho escuro para saídas e Verde escuro vibrante para entradas */}
        <span 
          className={`text-sm font-black leading-tight ${
            isNegative ? 'text-red-600' : 'text-emerald-600'
          }`}
        >
          {formatarValor(amount)}
        </span>
        <span className="text-[11px] text-slate-500 font-medium mt-1">
          {date}
        </span>
      </div>

    </div>
  );
}
