"use client";

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react'; 
import Tela from '../../../components/Tela'; 
import Card from '../../../components/Card';
import BotaoGrande from '../../../components/BotaoGrande';

export default function SucessoPix() {
  // 1. Consts estruturadas na sintaxe padrão das telas anteriores
  const [contaOrigem] = useState({
    id: "origem-123",
    tipoConta: "Conta Corrente (*1234)",
    brand: "ByeBank"
  });

  const [destinatario] = useState({
    nome: "João da Silva",
    chave: "***.456.***-00", 
    instituicao: "ByeBank"
  });

  const [transferencia] = useState({
    valor: "251,00",
    tarifa: "Grátis",
    dataHorario: "Hoje, às 09:41",
    idTransacao: "E00000000202402120941s01" 
  });

  const handleCompartilhar = () => {
    console.log("Ação: Compartilhar transação ID:", transferencia.idTransacao);
  };

  const handleVoltarInicio = () => {
    console.log("Ação: Voltar para a tela inicial");
  };

  return (
    <Tela>
      {/* Alinhamento dos elementos centrais na tela do smartphone */}
      <div className="flex flex-col items-center px-4 font-sans pb-6 pt-10 w-full">
        
        {/* 2. Ícone de Confirmação Verde Superior */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-5">
          <Check className="w-7 h-7 stroke-[2.5]" />
        </div>

        {/* Títulos de Sucesso */}
        <h1 className="text-xl font-bold text-slate-900 text-center tracking-tight">
          PIX Realizado!
        </h1>
        <p className="text-sm text-slate-400 text-center mt-1 mb-6">
          Transferência executada com sucesso.
        </p>

        {/* 3. Bloco do Comprovante utilizando o seu componente <Card> */}
        <Card paddingClass="p-6" bgClass="bg-white" roundedClass="rounded-2xl">
          <div className="flex flex-col gap-5">
            
            {/* Bloco de Destaque do Valor em Verde */}
            <div className="flex flex-col items-center justify-center text-center py-1">
              <span className="text-xs text-slate-400 font-medium">Valor enviado</span>
              <span className="text-3xl font-extrabold text-emerald-500 mt-1">
                R$ {transferencia.valor}
              </span>
            </div>

            {/* Linha Divisória Fina */}
            <div className="w-full h-[1px] bg-slate-100" />

            {/* Listagem dos dados amarrados às suas consts */}
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-start gap-4">
                <span className="text-slate-400 font-medium">Destinatário</span>
                <span className="font-bold text-slate-800 text-right">{destinatario.nome}</span>
              </div>
              
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400 font-medium">Chave CPF</span>
                <span className="font-bold text-slate-800 text-right">{destinatario.chave}</span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400 font-medium">Data / Horário</span>
                <span className="font-bold text-slate-800 text-right">{transferencia.dataHorario}</span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400 font-medium shrink-0">ID da Transação</span>
                <span className="font-bold text-slate-800 text-right break-all text-xs font-sans">
                  {transferencia.idTransacao}
                </span>
              </div>
            </div>

          </div>
        </Card>

        {/* 4. Ação de Compartilhar Comprovante */}
        <button
          type="button"
          onClick={handleCompartilhar}
          className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors py-2 px-4 focus:outline-none"
        >
          <Share2 className="w-4 h-4 stroke-[2.2]" />
          <span>Compartilhar comprovante</span>
        </button>

        {/* 5. Ação de Fechamento utilizando o seu componente <BotaoGrande> */}
        <div className="w-full mt-12">
          <BotaoGrande 
            text="Voltar ao início" 
            bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
            textClass="text-white font-semibold text-sm"
            widthClass="w-full"
            onClick={handleVoltarInicio}
          />
        </div>

      </div>
    </Tela>
  );
}
