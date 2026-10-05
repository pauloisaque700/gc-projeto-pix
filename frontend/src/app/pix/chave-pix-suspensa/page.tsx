import { Shield, Phone } from "lucide-react";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";

// Número de contato do banco — troque pelo número real de atendimento
const TELEFONE_SUPORTE = "+5508000000000";

export default function ChavePixSuspensaPage() {
  return (
    <Tela>
      <SmartphoneHeader
        title="chave-pix-suspensa"
        backToUrl="/pix/minhas-chaves-pix"
      />

      <div className="flex flex-col gap-4 font-sans">
        {/* Aviso de suspensão */}
        <div className="bg-[#F5F3FF] border border-[#EDE9FE] rounded-2xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#4F46E5] shrink-0 stroke-[1.8] mt-0.5" />
          <p className="text-sm text-slate-700 leading-relaxed">
            Essa chave pix foi suspensa. Entre em contato com o banco
            apertando no botão abaixo para solicitar uma análise.
          </p>
        </div>

        {/* Ação: liga direto para o suporte */}
        <a
          href={`tel:${TELEFONE_SUPORTE}`}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-4 transition-colors"
        >
          <Phone className="w-4 h-4 stroke-[2.2]" />
          Entrar em contato com o banco
        </a>
      </div>
    </Tela>
  );
}