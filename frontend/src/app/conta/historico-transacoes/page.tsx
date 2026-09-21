"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";

type TipoTransacao = "enviado" | "recebido" | "pagamento";

interface Transacao {
  id: string;
  tipo: TipoTransacao;
  titulo: string;
  nome: string;
  valor: string;
  dataLabel: string; // texto exibido (ex: "Hoje", "20/08")
  dataISO: string; // usado para filtrar por período (formato "YYYY-MM-DD")
}

// Dados de exemplo — troque pela busca real na sua API/banco quando integrar
const TRANSACOES: Transacao[] = [
  { id: "1", tipo: "recebido", titulo: "PIX recebido", nome: "Carlos Souza", valor: "+ R$ 500,00", dataLabel: "Hoje", dataISO: "2026-09-20" },
  { id: "2", tipo: "enviado", titulo: "PIX enviado", nome: "Maria Silva", valor: "- R$ 150,00", dataLabel: "Hoje", dataISO: "2026-09-20" },
  { id: "3", tipo: "pagamento", titulo: "Pagamento", nome: "Conta de luz", valor: "- R$ 230,00", dataLabel: "Hoje", dataISO: "2026-09-20" },
];

function IconeTransacao({ tipo }: { tipo: TipoTransacao }) {
  const enviadoOuPagamento = tipo === "enviado" || tipo === "pagamento";

  return (
    <div
      className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
        enviadoOuPagamento ? "bg-red-50" : "bg-emerald-50"
      }`}
    >
      {enviadoOuPagamento ? (
        <ArrowUpRight className="w-4 h-4 text-red-500 stroke-[2.2]" />
      ) : (
        <ArrowDownLeft className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
      )}
    </div>
  );
}

// Campo de data estilizado como "pill", com o input nativo sobreposto e
// invisível — clicar em qualquer lugar do botão abre o seletor de data
// do sistema, e o rótulo mostra a data escolhida (ou o placeholder).
function FiltroData({
  label,
  valor,
  onChange,
}: {
  label: string;
  valor: string;
  onChange: (novaData: string) => void;
}) {
  const dataFormatada = valor
    ? new Date(valor + "T00:00:00").toLocaleDateString("pt-BR")
    : label;

  return (
    <label className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium cursor-pointer hover:bg-slate-200 transition-colors">
      <Calendar className="w-4 h-4 text-emerald-600 stroke-[2]" />
      <span className={valor ? "text-slate-800" : "text-slate-500"}>
        {dataFormatada}
      </span>
      <input
        type="date"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label={label}
      />
    </label>
  );
}

export default function TransacoesDaContaPage() {
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const transacoesFiltradas = TRANSACOES.filter((transacao) => {
    if (dataInicial && transacao.dataISO < dataInicial) return false;
    if (dataFinal && transacao.dataISO > dataFinal) return false;
    return true;
  });

  return (
    <Tela>
      <SmartphoneHeader title="Transações da Conta" backToUrl="/dashboard" />

      <div className="flex flex-col flex-1 min-h-0 font-sans">
        {/* Filtro por período */}
        <div className="shrink-0 mb-4">
          <p className="text-sm font-bold text-slate-700 mb-2">Filtrar por:</p>
          <div className="flex gap-2">
            <FiltroData
              label="Data inicial"
              valor={dataInicial}
              onChange={setDataInicial}
            />
            <FiltroData
              label="Data final"
              valor={dataFinal}
              onChange={setDataFinal}
            />
          </div>
        </div>

        {/* Lista rolável de transações */}
        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {transacoesFiltradas.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Nenhuma transação encontrada nesse período.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {transacoesFiltradas.map((transacao) => (
                <li
                  key={transacao.id}
                  className="flex items-center justify-between gap-3 py-4"
                >
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-bold ${
                        transacao.tipo === "recebido"
                          ? "text-emerald-600"
                          : "text-slate-800"
                      }`}
                    >
                      {transacao.valor}
                    </span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      {transacao.dataLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-slate-800">
                        {transacao.titulo}
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5">
                        {transacao.nome}
                      </span>
                    </div>
                    <IconeTransacao tipo={transacao.tipo} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Tela>
  );
}