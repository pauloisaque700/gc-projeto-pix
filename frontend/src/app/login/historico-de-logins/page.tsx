import { ArrowDownLeft } from "lucide-react";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";

interface RegistroLogin {
  id: string;
  nomeConta: string;
  tipoConta: string;
  ultimoLogin: string;
}

const HISTORICO: RegistroLogin[] = [
  { id: "1", nomeConta: "(Nome da conta)", tipoConta: "(Conta corrente)", ultimoLogin: "30/05/2026, 19:00" },
  { id: "2", nomeConta: "(Nome da conta)", tipoConta: "(Conta corrente)", ultimoLogin: "30/05/2026, 19:00" },
  { id: "3", nomeConta: "(Nome da conta)", tipoConta: "(Conta corrente)", ultimoLogin: "30/05/2026, 19:00" },
];

export default function HistoricoDeLoginsPage() {
  return (
    <Tela>
      <SmartphoneHeader title="Histórico de Logins" backToUrl="/tela-principal" />

      <div className="flex flex-col flex-1 min-h-0 font-sans">
        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          <ul className="divide-y divide-slate-100">
            {HISTORICO.map((registro) => (
              <li key={registro.id} className="flex items-center gap-3 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 shrink-0">
                  <ArrowDownLeft className="w-4 h-4 text-blue-500 stroke-[2.2]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {registro.nomeConta}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {registro.tipoConta}
                  </p>
                </div>

                <p className="text-xs text-slate-400 text-right shrink-0 leading-relaxed">
                  Último login feito em:
                  <br />
                  {registro.ultimoLogin}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Tela>
  );
}