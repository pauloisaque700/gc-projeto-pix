"use client";

import React, { useState, useRef } from "react";
import { Calendar } from "lucide-react";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";
import CardTransferencias from "../../../components/CardTransferencias";

type TipoTransacao = "enviado" | "recebido" | "pagamento";

interface Transacao {
  id: string;
  tipo: TipoTransacao;
  titulo: string;
  nome: string;
  valor: string;      // Texto exibido (Ex: "+ R\$ 500,00")
  valorNumerico: number; // Mapeado para preencher o 'amount' do CardTransferencias
  dataLabel: string;  // Texto exibido (Ex: "Hoje")
  dataISO: string;    // Formato "YYYY-MM-DD" para filtros
}

// Dados de exemplo mantidos e estruturados com o valor numérico necessário para o card
const TRANSACOES: Transacao[] = [
  { id: "1", tipo: "recebido", titulo: "PIX recebido", nome: "Carlos Souza", valor: "+ R\$ 500,00", valorNumerico: 500.00, dataLabel: "Hoje", dataISO: "2026-09-20" },
  { id: "2", tipo: "enviado", titulo: "PIX enviado", nome: "Maria Silva", valor: "- R\$ 150,00", valorNumerico: -150.00, dataLabel: "Hoje", dataISO: "2026-09-20" },
  { id: "3", tipo: "pagamento", titulo: "Pagamento", nome: "Conta de luz", valor: "- R\$ 230,00", valorNumerico: -230.00, dataLabel: "Hoje", dataISO: "2026-09-20" },
];

export default function TransacoesDaContaPage() {
  const [dataInicial, setDataInicial] = useState<string>("");
  const [dataFinal, setDataFinal] = useState<string>("");

  const inputInicialRef = useRef<HTMLInputElement>(null);
  const inputFinalRef = useRef<HTMLInputElement>(null);

  const formatarDataBR = (dataString: string) => {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  // Lógica de Filtragem Dinâmica aplicada aos dados locais
  const transacoesFiltradas = TRANSACOES.filter((transacao) => {
    if (!dataInicial && !dataFinal) return true;

    const dataItem = transacao.dataISO;

    if (dataInicial && dataItem < dataInicial) return false;
    if (dataFinal && dataItem > dataFinal) return false;

    return true;
  });

  return (
    <Tela>
      <SmartphoneHeader title="Transações da Conta" backToUrl="/dashboard" />

      <div className="flex flex-col flex-1 min-h-0 font-sans">
        
        {/* Seção Filtros (Novos componentes de calendário por Referência) */}
        <section className="shrink-0 mb-4">
          <p className="text-sm font-semibold text-[#475569] mb-3">
            Filtrar por:
          </p>

          <div className="flex gap-2 justify-start">
            {/* BOX DATA INICIAL */}
            <div 
              onClick={() => inputInicialRef.current?.showPicker()}
              className="inline-flex items-center justify-center bg-[#4f46e5] border border-[#4f46e5] rounded-xl px-3 py-2 cursor-pointer transition-colors hover:bg-[#4338ca]"
            >
              <input
                ref={inputInicialRef}
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
              />
              <div className="flex items-center gap-1.5">
                {!dataInicial && <Calendar className="w-4 h-4 text-white stroke-[2.5]" />}
                <span className="text-xs font-medium text-white">
                  {dataInicial ? formatarDataBR(dataInicial) : "Data Inicial"}
                </span>
              </div>
            </div>

            {/* BOX DATA FINAL */}
            <div 
              onClick={() => inputFinalRef.current?.showPicker()}
              className="inline-flex items-center justify-center bg-[#4f46e5] border border-[#4f46e5] rounded-xl px-3 py-2 cursor-pointer transition-colors hover:bg-[#4338ca]"
            >
              <input
                ref={inputFinalRef}
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
              />
              <div className="flex items-center gap-1.5">
                {!dataFinal && <Calendar className="w-4 h-4 text-white stroke-[2.5]" />}
                <span className="text-xs font-medium text-white">
                  {dataFinal ? formatarDataBR(dataFinal) : "Data final"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Lista rolável utilizando o componente CardTransferencias */}
        <section className="flex-1 overflow-y-auto -mx-1 px-1 mt-2">
          {transacoesFiltradas.length > 0 ? (
            <div className="flex flex-col gap-1">
              {transacoesFiltradas.map((transacao) => (
                <CardTransferencias
                  key={transacao.id}
                  title={transacao.titulo}
                  description={transacao.nome}
                  amount={transacao.valorNumerico}
                  date={transacao.dataLabel}
                />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-400">
                Nenhuma transação encontrada nesse período.
              </p>
            </div>
          )}
        </section>
      </div>
    </Tela>
  );
}
