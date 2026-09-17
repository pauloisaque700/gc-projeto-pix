import Link from "next/link";
import { AlertCircle } from "lucide-react";
import Tela from "../../../components/Tela";

export default function ContaBloqueadaPage() {
  return (
    <Tela>
      <div className="flex flex-col flex-1 justify-between">
        {/* Conteúdo central */}
        <div className="flex flex-col items-center text-center gap-6 mt-16">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50">
            <AlertCircle className="w-8 h-8 text-slate-900 stroke-2" />
          </div>

          <p className="text-lg font-bold text-slate-800 leading-relaxed">
            Essa conta foi bloqueada.
            <br />
            Por favor, troque de conta.
            <br />
            Se acha que cometemos algum erro, entre em contato com o suporte
          </p>
        </div>

        {/* Ação */}
        <Link
          href="/"
          className="w-full text-center rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-4 transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </Tela>
  );
}