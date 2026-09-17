"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";

type TipoTransacao = "enviado" | "recebido" | "pagamento";
type Filtro = "recentes" | "antigos";

interface Transacao {
  id: string;
  tipo: TipoTransacao;
  titulo: string;
  nome: string;
  valor: string;
  data: string;
}

// Dados de exemplo — troque pela busca real na sua API/banco quando integrar
const TRANSACOES: Transacao[] = [
  { id: "1", tipo: "enviado", titulo: "PIX enviado", nome: "Maria Silva", valor: "- R$ 150,00", data: "Hoje" },
  { id: "2", tipo: "recebido", titulo: "PIX recebido", nome: "Carlos Souza", valor: "+ R$ 500,00", data: "Ontem" },
  { id: "3", tipo: "pagamento", titulo: "Pagamento", nome: "Conta de luz", valor: "- R$ 230,00", data: "20/08" },
  { id: "4", tipo: "enviado", titulo: "PIX enviado", nome: "Caio Barreto", valor: "- R$ 10,00", data: "02/08" },
  { id: "5", tipo: "pagamento", titulo: "Pagamento", nome: "Conta de luz", valor: "- R$ 190,00", data: "22/07" },
  { id: "6", tipo: "recebido", titulo: "PIX recebido", nome: "Xavier Silva", valor: "+ R$ 80,00", data: "10/07" },
  { id: "7", tipo: "enviado", titulo: "PIX enviado", nome: "Joaquim Nogueira", valor: "- R$ 50,00", data: "05/07" },
  { id: "8", tipo: "recebido", titulo: "PIX recebido", nome: "Luís Martins", valor: "+ R$ 200,00", data: "01/07" },
  { id: "9", tipo: "pagamento", titulo: "Pagamento", nome: "Conta de luz", valor: "- R$ 200,00", data: "21/06" },
  { id: "10", tipo: "enviado", titulo: "PIX enviado", nome: "Eduardo Siqueira", valor: "- R$ 50,00", data: "10/06" },
  { id: "11", tipo: "recebido", titulo: "PIX recebido", nome: "Igor Souza", valor: "+ R$ 30,00", data: "28/05" },
  { id: "12", tipo: "pagamento", titulo: "Pagamento", nome: "Conta de luz", valor: "- R$ 170,00", data: "22/06" },
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

export default function HistoricoTransacoesPage() {
  const [filtro, setFiltro] = useState<Filtro>("recentes");

  // "Recentes" mantém a ordem original (mais novo primeiro, como já vem
  // dos dados). "Antigos" inverte, trazendo os mais antigos pro topo.
  const transacoesOrdenadas =
    filtro === "recentes" ? TRANSACOES : [...TRANSACOES].reverse();

  return (
    <Tela>
      <SmartphoneHeader
        title="Histórico de Transações"
        backToUrl="/dashboard"
      />

      <div className="flex flex-col flex-1 min-h-0 font-sans">
        {/* Abas de filtro */}
        <div className="shrink-0 flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setFiltro("recentes")}
            aria-pressed={filtro === "recentes"}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              filtro === "recentes"
                ? "bg-[#4F46E5] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Recentes
          </button>
          <button
            type="button"
            onClick={() => setFiltro("antigos")}
            aria-pressed={filtro === "antigos"}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              filtro === "antigos"
                ? "bg-[#4F46E5] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Antigos
          </button>
        </div>

        {/* Lista rolável de transações */}
        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          <ul className="divide-y divide-slate-100">
            {transacoesOrdenadas.map((transacao) => (
              <li key={transacao.id} className="flex items-center gap-3 py-4">
                <IconeTransacao tipo={transacao.tipo} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {transacao.titulo}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {transacao.nome}
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={`text-sm font-semibold ${
                      transacao.tipo === "recebido"
                        ? "text-emerald-600"
                        : "text-slate-800"
                    }`}
                  >
                    {transacao.valor}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    {transacao.data}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Tela>
  );
}