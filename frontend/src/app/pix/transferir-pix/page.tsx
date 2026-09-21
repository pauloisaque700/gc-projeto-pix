"use client"

import React, { useState } from 'react';
import { ArrowLeft, Search, Wallet, ArrowRight, DollarSign } from 'lucide-react'; // Ícones equivalentes ao print
import Tela from '../../../components/Tela';
import SmartphoneHeader from '../../../components/SmartphoneHeader';
import Card from '../../../components/Card';
import CardConta from '../../../components/CardConta';
import Input from '../../../components/Input';
import BotaoGrande from '../../../components/BotaoGrande';

export default function TransferirPix() {  
  // Mock das contas (mesmo padrão usado no seu Dropdown anterior)

    interface Conta {
        id: string;
        tipoConta: string;
        saldo?: string;
        brand?: string;
    }

  const contasDisponiveis = [
    { id: '1', tipoConta: 'Conta Corrente', saldo: '1.500,00', brand: 'ByeBank' }
  ];

  const [contaOrigem, setContaOrigem] = useState<Conta>(contasDisponiveis[0]);
  const [chaveDestinatario, setChaveDestinatario] = useState('');
  const [valorTransferencia, setValorTransferencia] = useState('250,00');
  const [loading, setLoading] = useState(false);
  const [limiteOperacional, setLimiteOperacional] = useState(5000.00); // Limite operacional restante

  const handleContinuar = () => {
    setLoading(true);
    console.log("Avançando com a transferência:", { contaOrigem, chaveDestinatario, valorTransferencia });
    // Lógica para avançar de passo ou enviar para a API
  };

  return (
    <Tela>
      <SmartphoneHeader title="TRANSFERIR PIX" backToUrl="/tela-principal" />

      <Card paddingClass="p-5" bgClass="bg-white">
        <div className="flex flex-col gap-5">
          
          {/* 1. Seleção da Conta de Origem */}
          <div className="flex flex-col gap-2 w-full font-sans">
            <label className="text-sm font-semibold text-slate-700">
              Origem da transferência
            </label>
            {/* O onSelect agora casa perfeitamente com o tipo (conta: Conta) => void */}
            <CardConta 
                tipoConta={contaOrigem.tipoConta}    // 👈 Corrigido para contaOrigem
                nomeBanco={contaOrigem.brand || ''}  // 👈 Pega o 'brand' do seu objeto
                saldo={contaOrigem.saldo || '0,00'}  // 👈 Passa a string direta, sem toLocaleString
            />
          </div>

          {/* 2. Campo do Destinatário usando seu componente Input */}
          <Input 
            label="Chave PIX do destinatário"
            placeholder="E-mail, CPF, celular ou chave aleatória" 
            icon={<Search className="w-5 h-5 stroke-[1.8]" />} 
            value={chaveDestinatario}
            onChange={(e) => setChaveDestinatario(e.target.value)}
          />

          {/* 3. Campo de Valor usando seu componente Input */}
          <div className="relative">
            <Input 
              label="Quanto deseja transferir?"
              placeholder="250,00" 
              type="text"
              icon={<DollarSign className="w-5 h-5 stroke-[1.8]" />} 
              value={valorTransferencia}
              onChange={(e) => setValorTransferencia(e.target.value)}
            />
            {/* O foco do seu Input aplica a borda #4F46E5 perfeitamente igual ao print */}
            <span className="absolute -bottom-5 left-0 text-xs text-slate-400 font-sans">
              Limite operacional restante: R$ {limiteOperacional.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* 4. Botão Principal de Envio */}
          <div className="mt-5">
            <BotaoGrande 
              text="Continuar" 
              bgClass="bg-[#4F46E5] hover:bg-[#4338CA]" 
              textClass="text-white font-semibold text-base"       
              widthClass="w-full"                        
              isLoading={loading} 
              disabled={!chaveDestinatario || !valorTransferencia || loading} 
              onClick={handleContinuar}
            />
          </div>

        </div>
      </Card>
    </Tela>
  );
}
