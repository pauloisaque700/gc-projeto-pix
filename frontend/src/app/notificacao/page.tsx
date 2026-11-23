import Tela from "../../components/Tela";
import SmartphoneHeader from "../../components/SmartphoneHeader";

export default function Notificacoes() {
  return (
    <Tela>
      <SmartphoneHeader title="Notificações" backToUrl="/tela-principal" />
      <p className="text-sm text-slate-600">Notificações indisponíveis neste ambiente.</p>
    </Tela>
  );
}
