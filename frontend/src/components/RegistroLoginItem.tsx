import { ArrowDownLeft } from "lucide-react";

interface RegistroLoginItemProps {
  nomeConta: string;
  tipoConta: string;
  dataUltimoLogin: string;
  horarioUltimoLogin: string;
}

export default function RegistroLoginItem({
  nomeConta,
  tipoConta,
  dataUltimoLogin,
  horarioUltimoLogin,
}: RegistroLoginItemProps) {
  return (
    <div className="flex items-center gap-3 py-4">
      {/* Ícone */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 shrink-0">
        <ArrowDownLeft className="w-4 h-4 text-blue-500 stroke-[2.2]" />
      </div>

      {/* Informações da conta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {nomeConta}
        </p>

        <p className="text-xs text-slate-400 truncate">
          {tipoConta}
        </p>
      </div>

      {/* Informações do login */}
      <div className="text-xs text-slate-400 text-right shrink-0 leading-relaxed">
        <p>Último login feito em:</p>

        <p>
          {dataUltimoLogin}, {horarioUltimoLogin}
        </p>
      </div>
    </div>
  );
}
