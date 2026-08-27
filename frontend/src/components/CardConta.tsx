import { Wallet } from 'lucide-react';

interface CardContaProps {
  tipoConta: string;    // ex: "Conta Corrente"
  saldo: string;        // ex: "1.500,00"
  nomeBanco: string;    // ex: "ByeBank"
}

export default function CardConta({ tipoConta, saldo, nomeBanco }: CardContaProps) {
  return (
    <div className="w-full bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between font-sans shadow-sm">
      {/* Lado Esquerdo: Ícone + Textos de identificação */}
      <div className="flex items-center gap-3">
        {/* Círculo com fundo roxo sutil e ícone de carteira idêntico à imagem */}
        <div className="w-10 h-10 rounded-full bg-[#F5F3FF] flex items-center justify-center text-[#4F46E5]">
          <Wallet className="w-5 h-5 stroke-[2]" />
        </div>
        
        {/* Textos empilhados */}
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 leading-tight">
            {tipoConta}
          </span>
          <span className="text-xs text-slate-400 mt-0.5">
            Saldo: R$ {saldo}
          </span>
        </div>
      </div>

      {/* Lado Direito: Nome do Banco com cor sutil */}
      <span className="text-xs font-semibold text-slate-400 tracking-wide pr-1">
        {nomeBanco}
      </span>
    </div>
  );
}
