import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";
import RegistroLoginItem from "../../../components/RegistroLoginItem";

interface RegistroLogin {
  id: string;
  nomeConta: string;
  tipoConta: string;
  dataUltimoLogin: string;
  horarioUltimoLogin: string;
}

const HISTORICO: RegistroLogin[] = [
  {
    id: "1",
    nomeConta: "(Nome da conta)",
    tipoConta: "(Conta corrente)",
    dataUltimoLogin: "30/05/2026",
    horarioUltimoLogin: "19:00",
  },
  {
    id: "2",
    nomeConta: "(Nome da conta)",
    tipoConta: "(Conta corrente)",
    dataUltimoLogin: "30/05/2026",
    horarioUltimoLogin: "19:00",
  },
  {
    id: "3",
    nomeConta: "(Nome da conta)",
    tipoConta: "(Conta corrente)",
    dataUltimoLogin: "30/05/2026",
    horarioUltimoLogin: "19:00",
  },
];

export default function HistoricoDeLoginsPage() {
  return (
    <Tela>
      <SmartphoneHeader
        title="Histórico de Logins"
        backToUrl="/tela-principal"
      />

      <div className="flex flex-col flex-1 min-h-0 font-sans">
        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          <ul className="divide-y divide-slate-100">
            {HISTORICO.map((registro) => (
              <li key={registro.id}>
                <RegistroLoginItem
                  nomeConta={registro.nomeConta}
                  tipoConta={registro.tipoConta}
                  dataUltimoLogin={registro.dataUltimoLogin}
                  horarioUltimoLogin={registro.horarioUltimoLogin}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Tela>
  );
}
