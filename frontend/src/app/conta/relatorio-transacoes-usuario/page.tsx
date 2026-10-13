'use client';

import React, { useState, useRef } from 'react';
import Tela from '../../..//components/Tela';
import SmartphoneHeader from '../../../components/SmartphoneHeader';
import CardTransferencias from '../../../components/CardTransferencias'; 
import { Calendar } from 'lucide-react';

// 1. Dados estruturados com um campo 'dateISO' padronizado para comparação real
const listaTransacoes = [
  { 
    id: '1', 
    title: 'PIX enviado', 
    description: 'Maria Silva', 
    amount: -150.00, 
    date: 'Hoje',
    dateISO: '2026-09-18' // Exemplo baseado no dia atual
  },
  { 
    id: '2', 
    title: 'PIX recebido', 
    description: 'Carlos Souza', 
    amount: 500.00, 
    date: 'Ontem',
    dateISO: '2026-09-17'
  },
  { 
    id: '3', 
    title: 'Pagamento', 
    description: 'Conta de luz', 
    amount: -230.00, 
    date: '20/08',
    dateISO: '2026-08-20'
  },
];

export default function TransacoesPage() {
  const [dataInicial, setDataInicial] = useState<string>('');
  const [dataFinal, setDataFinal] = useState<string>('');

  const inputInicialRef = useRef<HTMLInputElement>(null);
  const inputFinalRef = useRef<HTMLInputElement>(null);

  const formatarDataBR = (dataString: string) => {
    if (!dataString) return '';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // 2. Lógica de Filtragem Dinâmica
  const transacoesFiltradas = listaTransacoes.filter((transacao) => {
    // Se nenhuma data foi escolhida, exibe a lista inteira
    if (!dataInicial && !dataFinal) return true;

    const dataItem = transacao.dateISO;

    // Se houver data inicial, o item deve ser igual ou posterior a ela
    if (dataInicial && dataItem < dataInicial) {
      return false;
    }

    // Se houver data final, o item deve ser igual ou anterior a ela
    if (dataFinal && dataItem > dataFinal) {
      return false;
    }

    return true;
  });

  return (
    <Tela>
      <SmartphoneHeader 
        title="Transações do Usuário" 
        backToUrl="/conta/minhas-contas-bancarias"
      />

      {/* Seção Filtros */}
      <section className="w-full">
        <p className="text-sm font-semibold text-[#475569] mb-3">
          Filtrar por:
        </p>

        <div className="flex gap-2 justify-start mb-6">
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
                {dataInicial ? formatarDataBR(dataInicial) : 'Data Inicial'}
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
                {dataFinal ? formatarDataBR(dataFinal) : 'Data final'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Renderiza a lista filtrada ou uma mensagem caso esteja vazia */}
      <section className="flex-1 flex flex-col w-full mt-2">
        {transacoesFiltradas.length > 0 ? (
          transacoesFiltradas.map((transacao) => (
            <CardTransferencias
              key={transacao.id}
              title={transacao.title}
              description={transacao.description}
              amount={transacao.amount}
              date={transacao.date}
            />
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-slate-400">
              Nenhuma transação encontrada para este período.
            </p>
          </div>
        )}
      </section>
    </Tela>
  );
}
