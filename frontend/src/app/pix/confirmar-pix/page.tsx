"use client";

import { useState } from 'react';
import { Info, ShieldCheck } from 'lucide-react'; 
import Tela from '../../../components/Tela'; 
import SmartphoneHeader from '../../../components/SmartphoneHeader';
import Card from '../../../components/Card';
import Tag from '../../../components/Tag';
import BotaoGrande from '../../../components/BotaoGrande';

export default function ConfirmarPix() {
  const [loading, setLoading] = useState(false);

  // 1. Consts puras contendo todos os dados que aparecem na tela
  const [contaOrigem] = useState({
    id: "origem-123",
    tipoConta: "Conta Corrente (*1234)",
    brand: "ByeBank"
  });

  const [destinatario] = useState({
    nome: "João da Silva",
    chave: "123.456.789-00",
    instituicao: "ByeBank"
  });

  const [transferencia] = useState({
    valor: "251,00",
    tarifa: "Grátis"
  });

  // 2. Função que processará o clique de envio
  const handleConfirmarTransferencia = () => {
    setLoading(true);
    
    // Objeto pronto unificando os dados para enviar para o seu backend
    const dadosParaEnvio = {
      contaOrigemId: contaOrigem.id,
      chaveDestinatario: destinatario.chave,
      valor: transferencia.valor,
    };
    
    console.log("Integrar aqui a chamada de API enviando isto:", dadosParaEnvio);
    
    // Simulação do fim do carregamento
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Tela>
      <SmartphoneHeader title="CONFIRMAR PIX" backToUrl="/pix/transferir-pix" />

      <div className="flex flex-col gap-4 px-4 font-sans pb-6">
        
        {/* Banner Informativo Superior usando seu <Card> */}
        <Card 
          bgClass="bg-[#EEF2FF]" 
          borderClass="border border-[#E0E7FF]" 
          paddingClass="p-3.5" 
          roundedClass="rounded-xl"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5 stroke-[1.8]" />
            <p className="text-xs text-[#4F46E5] font-medium leading-relaxed">
              Revise com atenção as informações antes de finalizar o envio.
            </p>
          </div>
        </Card>

        {/* Card Principal com os dados mapeados diretamente das suas consts */}
        <Card paddingClass="p-6" bgClass="bg-white" roundedClass="rounded-3xl">
          <div className="flex flex-col gap-6">
            
            {/* Bloco de Destaque do Valor */}
            <div className="flex flex-col items-center justify-center text-center pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor a transferir</span>
              <span className="text-3xl font-extrabold text-slate-900 mt-1">
                R$ {transferencia.valor}
              </span>
            </div>

            <div className="w-full h-[1px] bg-slate-100" />

            {/* Lista de Informações extraídas das consts de estado */}
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-start gap-4">
                <span className="text-slate-400 font-medium">Para</span>
                <span className="font-bold text-slate-800 text-right">{destinatario.nome}</span>
              </div>
              
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400 font-medium">Chave PIX / CPF</span>
                <span className="font-bold text-slate-800 text-right">{destinatario.chave}</span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400 font-medium">Instituição</span>
                <span className="font-bold text-slate-800 text-right">{destinatario.instituicao}</span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400 font-medium">Origem</span>
                <span className="font-bold text-slate-800 text-right">
                  {contaOrigem.tipoConta}
                </span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400 font-medium">Tarifa</span>
                <Tag label={transferencia.tarifa} variant="green" />
              </div>
            </div>
          </div>
        </Card>

        {/* Banner de Segurança Inferior usando seu <Card> */}
        <Card 
          bgClass="bg-[#F8FAFC]" 
          borderClass="border border-slate-100" 
          paddingClass="p-3.5" 
          roundedClass="rounded-xl"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5 stroke-[1.8]" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Transação segura pelo protocolo de segurança Banco Central.
            </p>
          </div>
        </Card>

        {/* Bloco de Botões usando o seu <BotaoGrande> */}
        <div className="flex gap-3 mt-4 w-full">
          <div className="flex-1">
            <BotaoGrande 
              text="Cancelar" 
              bgClass="bg-white hover:bg-slate-50"
              borderClass="border border-slate-200"
              textClass="text-slate-600 font-semibold text-sm"
              widthClass="w-full"
              onClick={() => window.history.back()}
            />
          </div>
          
          <div className="flex-1">
            <BotaoGrande 
              text="Confirmar PIX" 
              bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
              textClass="text-white font-semibold text-sm"
              widthClass="w-full"
              isLoading={loading}
              onClick={handleConfirmarTransferencia}
            />
          </div>
        </div>

      </div>
    </Tela>
  );
}
