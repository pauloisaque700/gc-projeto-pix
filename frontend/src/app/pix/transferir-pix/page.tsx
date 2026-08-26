import React, { useState } from 'react';
import { ArrowLeft, Search, Wallet, ArrowRight } from 'lucide-react'; // Ícones equivalentes ao print
import Tela from '../../../components/Tela';
import SmartphoneHeader from '../../../components/SmartphoneHeader';
import Card from '../../../components/Card';
import Dropdown from '../../../components/DropDown';
import Input from '../../../components/Input';
import BotaoGrande from '../../../components/BotaoGrande';

export default function TransferirPix() {  
  // Mock das contas (mesmo padrão usado no seu Dropdown anterior)
  const contasDisponiveis = [
    { id: '1', label: 'Conta Corrente', sublabel: 'Saldo: R$ 1.500,00', brand: 'ByeBank' }
  ];

  const [contaOrigem, setContaOrigem] = useState(contasDisponiveis[0]);
  const [chaveDestinatario, setChaveDestinatario] = useState('');
  const [valorTransferencia, setValorTransferencia] = useState('250,00');
  const [loading, setLoading] = useState(false);


  // Mock de contatos recentes
  const contatosRecentes = [
    { id: '1', initials: 'JS', nome: 'João' },
    { id: '2', initials: 'MO', nome: 'Maria' },
    { id: '3', initials: 'CR', nome: 'Carlos' }
  ];

  const handleContinuar = () => {
    setLoading(true);
    console.log("Avançando com a transferência:", { contaOrigem, chaveDestinatario, valorTransferencia });
    // Lógica para avançar de passo ou enviar para a API
  };

  return (
    <Tela>
      {/* Cabeçalho igual ao padrão do seu app */}
      <SmartphoneHeader title="TRANSFERIR PIX" backToUrl="/pix" />

      {/* Container principal usando o seu componente Card */}
      <Card paddingClass="p-5" bgClass="bg-white">
        <div className="flex flex-col gap-5">
          
          {/* 1. Origem da transferência */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-800">
              Origem da transferência
            </label>
            {/* Reaproveitando seu Dropdown. Caso precise exibir o saldo como no print, 
                o componente Dropdown deve estar preparado para renderizar sublabels */}
            <Dropdown  
              options={contasDisponiveis} 
              onSelect={(conta) => setContaOrigem(conta)}
            />
          </div>

          {/* 2. Chave PIX do destinatário */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-800">
              Chave PIX do destinatário
            </label>
            <Input 
                label="label"
                placeholder="E-mail, CPF, celular ou chave aleatória" 
                icon={<Search className="w-5 h-5 text-slate-400 stroke-[1.8]" />} 
                value={chaveDestinatario}
                onChange={(e) => setChaveDestinatario(e.target.value)}
            />
          </div>

          {/* 3. Quanto deseja transferir */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-800">
              Quanto deseja transferir?
            </label>
            {/* Input customizado com a borda roxa/azul do print e texto grande */}
            <div className="relative flex items-center border-2 border-[#4F46E5] rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-[#4F46E5]/20 transition-all">
              <span className="text-xl font-bold text-[#4F46E5] mr-2">R$</span>
              <input 
                type="text" 
                value={valorTransferencia}
                onChange={(e) => setValorTransferencia(e.target.value)}
                className="w-full text-xl font-bold text-slate-900 bg-transparent outline-none border-none p-0"
              />
            </div>
            <span className="text-xs text-slate-400 mt-1">
              Limite operacional restante: R$ 5.000,00
            </span>
          </div>

          {/* 4. Contatos Recentes */}
          <div className="flex flex-col gap-3 mt-2">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              Contatos recentes
            </span>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {contatosRecentes.map((contato) => (
                <button
                  key={contato.id}
                  onClick={() => setChaveDestinatario(contato.nome)} // Exemplo de ação ao clicar
                  className="flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] active:scale-95 transition-all px-3 py-1.5 rounded-full border border-slate-200"
                >
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[10px] font-bold">
                    {contato.initials}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{contato.nome}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Botão de Ação Principal */}
          <div className="mt-4">
            <BotaoGrande 
              text="Continuar" 
              bgClass="bg-[#4F46E5] hover:bg-[#4338CA]" 
              textClass="text-white font-semibold text-base"       
              widthClass="w-full"                        
              isLoading={loading} 
              disabled={!valorTransferencia || loading} 
              onClick={handleContinuar}
            />
          </div>

        </div>
      </Card>
    </Tela>
  );
}
