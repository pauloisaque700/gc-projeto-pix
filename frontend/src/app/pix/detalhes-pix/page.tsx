"use client"

import { Share, Wallet, AlertCircle } from "lucide-react";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";

export default function DetalhesPixPage() {
  // Variáveis para integração com o backend
  const tipo = "enviado"; // "enviado" ou "recebido"
  const valor = "R$ 250,00";
  const destinatario = "João da Silva";
  const chavePix = "***.456.***-00";
  const dataHora = "Hoje, às 09:41";
  const idTransacao = "E00000000202402120941s01";
  const prazoEstornoExpirado = true;

  const handleCompartilhar = () => {
    // Ação de compartilhar comprovante
  };

  const handleSolicitarEstorno = () => {
    // Ação de solicitar estorno
  };

  return (
    <Tela>
      <SmartphoneHeader
        title="Detalhes do pix"
        backToUrl="/pix/extrato"
      />

      <div className="flex flex-col gap-5 font-sans">
        {/* Card principal de detalhes */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          {/* Valor */}
          <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
            <span className="text-xs text-slate-400 mb-1">
              {tipo === "enviado" ? "Valor enviado" : "Valor recebido"}
            </span>
            <strong className="text-[28px] font-bold text-slate-900 tracking-tight">
              {valor}
            </strong>
          </div>

          {/* Lista de informações */}
          <div className="flex flex-col gap-3.5 pt-4 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Destinatário</span>
              <span className="font-semibold text-slate-900 text-right">
                {destinatario}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Chave PIX</span>
              <span className="font-semibold text-slate-900 text-right">
                {chavePix}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Data / Horário</span>
              <span className="font-semibold text-slate-900 text-right">
                {dataHora}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 shrink-0">ID da Transação</span>
              <span className="font-semibold text-slate-900 text-right truncate">
                {idTransacao}
              </span>
            </div>
          </div>
        </div>

        {/* Link de compartilhamento */}
        <button
          type="button"
          onClick={handleCompartilhar}
          className="flex items-center justify-center gap-2 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] py-1 transition-colors cursor-pointer"
        >
          <Share className="w-4 h-4 stroke-" />
          Compartilhar comprovante
        </button>

        {/* Botão primário: Solicitar estorno */}
        <button
          type="button"
          onClick={handleSolicitarEstorno}
          disabled={prazoEstornoExpirado}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold py-4 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Wallet className="w-4 h-4 stroke-" />
          Solicitar estorno
        </button>

        {/* Alerta de prazo expirado */}
        {prazoEstornoExpirado && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-3.5 py-2.5 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 stroke-" />
            <p className="text-[11px] font-medium text-[#DC2626]">
              Você passou o prazo de 90 dias para solicitar o estorno.
            </p>
          </div>
        )}
      </div>
    </Tela>
  );
}
