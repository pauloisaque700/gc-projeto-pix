import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";

export default function HistoricoDeLoginsPage() {
  return (
    <Tela>
      <SmartphoneHeader title="Histórico de Logins" backToUrl="/conta/minhas-contas-bancarias" />
      <p className="text-sm text-slate-600">
        O histórico de logins está indisponível. Este ambiente usa uma sessão local e não registra eventos de autenticação.
      </p>
    </Tela>
  );
}
