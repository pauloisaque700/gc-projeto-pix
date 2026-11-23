"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, DollarSign, ChevronDown, Calendar, Clock } from 'lucide-react';
import Tela from '../../../components/Tela';
import SmartphoneHeader from '../../../components/SmartphoneHeader';
import Card from '../../../components/Card';
import CardConta from '../../../components/CardConta';
import Input from '../../../components/Input';
import BotaoGrande from '../../../components/BotaoGrande';

export default function TransferirPix() {  
  const router = useRouter();

  interface Conta {
    id: string;
    tipoConta: string;
    saldo?: string;
    brand?: string;
  }

  const contasDisponiveis = [
    { id: '1', tipoConta: 'Conta Corrente', saldo: '1.500,00', brand: 'ByeBank' }
  ];

  const [contaOrigem] = useState<Conta>(contasDisponiveis[0]);
  const [chaveDestinatario, setChaveDestinatario] = useState('');
  const [valorTransferencia, setValorTransferencia] = useState('250,00');
  const [loading, setLoading] = useState(false);
  const [limiteOperacional] = useState(5000.00);

  // Novos estados adicionados para os novos elementos da tela
  const [tipoTransferencia, setTipoTransferencia] = useState('instantaneo');
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [horaAgendamento, setHoraAgendamento] = useState('');

  const contatosRecentes = [
    { id: '1', iniciais: 'JS', nome: 'João', chave: 'joao@email.com' },
    { id: '2', iniciais: 'MO', nome: 'Maria', chave: '11999999999' },
    { id: '3', iniciais: 'CR', nome: 'Carlos', chave: '123.456.789-00' },
  ];

  const handleContinuar = () => {
    setLoading(true);
    console.log("Avançando com a transferência:", { 
      contaOrigem, 
      chaveDestinatario, 
      valorTransferencia,
      tipoTransferencia,
      dataAgendamento,
      horaAgendamento
    });
    // Lógica para avançar de passo ou enviar para a API
  };

  // Cancela o PIX: para o loading, volta os campos ao estado inicial e sai da tela
  const handleCancelar = () => {
    setLoading(false);
    setChaveDestinatario('');
    setValorTransferencia('250,00');
    setTipoTransferencia('instantaneo');
    setDataAgendamento('');
    setHoraAgendamento('');
    router.push('/tela-principal');
  };

  return (
    <Tela>
      <SmartphoneHeader title="TRANSFERIR PIX" backToUrl="/tela-principal" />
      <Card paddingClass="p-5">
        {!dados && !erroSessao && <p role="status">Carregando suas contas...</p>}
        {erroSessao && (
          <>
            <p role="alert" className="text-sm text-red-600">{erroSessao}</p>
            <button type="button" className="text-sm text-indigo-700" onClick={recarregar}>Tentar novamente</button>
          </>
        )}
        {dados && <FormularioPix key={sessao.versao} dados={dados} sessao={sessao} />}
      </Card>
    </Tela>
  );
}

      <Card paddingClass="p-5" bgClass="bg-white">
        <div className="flex flex-col gap-5">
          
          {/* 1. Seleção da Conta de Origem */}
          <div className="flex flex-col gap-2 w-full font-sans">
            <label className="text-sm font-semibold text-slate-700">
              Origem da transferência
            </label>
            <CardConta 
              tipoConta={contaOrigem.tipoConta}
              nomeBanco={contaOrigem.brand || ''}
              saldo={contaOrigem.saldo || '0,00'}
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

          {/* 3. Campo de Valor + Seletor Instantâneo + Data/Hora */}
          <div className="flex flex-col gap-3">
            <Input 
              label="Quanto deseja transferir?"
              placeholder="250,00" 
              type="text"
              icon={<DollarSign className="w-5 h-5 stroke-[1.8]" />} 
              value={valorTransferencia}
              onChange={(e) => setValorTransferencia(e.target.value)}
            />

            {/* Dropdown Instantâneo / Agendado */}
            <div className="relative">
              <select
                value={tipoTransferencia}
                onChange={(e) => {
                  const valor = e.target.value;
                  setTipoTransferencia(valor);
                  if (valor === 'instantaneo') {
                    setDataAgendamento('');
                    setHoraAgendamento('');
                  }
                }}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#4F46E5] transition-colors cursor-pointer"
              >
                <option value="instantaneo">Instantâneo</option>
                <option value="agendado">Agendado</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Limite operacional */}
            <span className="text-xs text-slate-400 font-sans">
              Limite operacional restante: R$ {limiteOperacional.toFixed(2).replace('.', ',')}
            </span>

            {/* Botões/Pílulas de Data e Hora (aparecem apenas quando 'agendado' está selecionado) */}
            {tipoTransferencia === 'agendado' && (
              <div className="flex items-center gap-2.5 pt-1">
                <label className="relative flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-medium px-3.5 py-2 rounded-full cursor-pointer transition-colors">
                  <Calendar className="w-3.5 h-3.5 stroke-2" />
                  <span>{dataAgendamento || 'Data'}</span>
                  <input
                    type="date"
                    value={dataAgendamento}
                    onChange={(e) => setDataAgendamento(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>

                <label className="relative flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-medium px-3.5 py-2 rounded-full cursor-pointer transition-colors">
                  <Clock className="w-3.5 h-3.5 stroke-2" />
                  <span>{horaAgendamento || 'Hora'}</span>
                  <input
                    type="time"
                    value={horaAgendamento}
                    onChange={(e) => setHoraAgendamento(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>

          {/* 4. Contatos Recentes */}
          <div className="flex flex-col gap-2.5 pt-2 font-sans">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CONTATOS RECENTES
            </span>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {contatosRecentes.map((contato) => (
                <button
                  key={contato.id}
                  type="button"
                  onClick={() => setChaveDestinatario(contato.chave)}
                  className="flex items-center gap-2 bg-white border border-slate-100 hover:border-[#4F46E5] rounded-full py-1.5 pl-1.5 pr-3.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold flex items-center justify-center">
                    {contato.iniciais}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {contato.nome}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Botões Inferiores: Cancelar + Continuar */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={handleCancelar}
              className="w-full rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-base py-3.5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

  if (contasAtivas.length === 0) {
    return (
      <p className="text-sm text-slate-700">
        Você precisa de uma conta ativa para transferir.{" "}
        <Link href="/conta/minhas-contas-bancarias" className="font-semibold text-indigo-700">Minhas Contas</Link>
      </p>
    );
  }

  return (
    <form onSubmit={continuar} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="conta-origem" className="text-sm font-semibold text-slate-700">Origem da transferência</label>
        <select
          id="conta-origem"
          value={contaOrigem?.id ?? ""}
          onChange={(event) => setContaId(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
        >
          <option value="">Selecione uma conta</option>
          {contasAtivas.map((conta) => <option key={conta.id} value={conta.id}>{rotuloConta(conta)}</option>)}
        </select>
        {contaOrigem && (
          <p className="text-xs text-slate-600">
            Saldo disponível {formatarMoeda(contaOrigem.saldo)} · Limite diário {formatarMoeda(contaOrigem.limiteDiario)}
          </p>
        )}
      </div>
      <Input
        label="Chave PIX do destinatário"
        placeholder="E-mail, CPF, CNPJ, celular ou chave aleatória"
        icon={<Search className="h-5 w-5" />}
        value={chaveDestino}
        onChange={(event) => setChaveDestino(event.target.value)}
      />
      <Input
        label="Quanto deseja transferir?"
        placeholder="0,00"
        icon={<DollarSign className="h-5 w-5" />}
        value={valorTexto}
        onChange={(event) => setValorTexto(event.target.value)}
      />
      <p className="text-xs text-slate-600">A API oferece PIX imediato. Agendamento está indisponível.</p>
      {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/tela-principal" className="rounded-xl border border-slate-200 py-4 text-center text-sm font-semibold text-slate-600">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={!contaOrigem || !chaveDestino.trim() || !valorTexto.trim()}
          className="rounded-xl bg-indigo-600 py-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          Continuar
        </button>
      </div>
    </form>
  );
}