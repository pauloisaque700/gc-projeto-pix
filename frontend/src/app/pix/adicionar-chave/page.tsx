"use client";

import { ArrowLeft } from "lucide-react";
import { Mail, CreditCard, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function PixScreen() {
    const [tipoChave, setTipoChave] = useState('email');
    const opcoesChave = [
        { id: 'cpf', label: 'CPF' },
        { id: 'cnpj', label: 'CNPJ' },
        { id: 'email', label: 'E-mail' },
        { id: 'telefone', label: 'Telefone' },
    ];

  return (
    //Simulador de tela de celular
    <div className="min-h-screen bg-slate-50 md:flex md:justify-center md:items-center">
      <main className="w-full min-h-screen bg-white px-4 py-6 flex flex-col font-sans md:max-w-[440px] md:min-h-[840px] md:shadow-lg md:rounded-2xl">
        
        {/* Cabeçalho da Tela, que tem a seta e o título */}
        <header className="flex items-center mb-6">
          {/* Botão com ícone de Seta para Voltar pra tela anterior */}
          <button className="p-2 -ml-2 text-slate-800">
            <ArrowLeft className="w-6 h-6 stroke-2" />
          </button>
          {/* Título da tela */}
          <h1 className="text-xl font-bold text-slate-800 flex-1 text-center pr-6">
            Adicionar Chave PIX
          </h1>
        </header>

        {/* Card */}
        <div className="w-full max-w-[400px] bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-5 font-sans">
      
      {/* Tag do Passo */}
      <div>
        <span className="inline-block bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wider">
          PASSO 1: VALIDAÇÃO
        </span>
      </div>

      {/* Seção: Tipo de Chave */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Tipo de chave
        </label>
        
        {/* Grid com os botões de rádio customizados */}
        <div className="grid grid-cols-2 gap-3">
          {opcoesChave.map((opcao) => {
            const isSelected = tipoChave === opcao.id;
            return (
              <button
                key={opcao.id}
                type="button"
                onClick={() => setTipoChave(opcao.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all text-left
                  ${isSelected 
                    ? 'border-[#4F46E5] bg-white text-[#4F46E5] ring-1 ring-[#4F46E5]' 
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
              >
                {/* Custom Radio Circle */}
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0
                  ${isSelected ? 'border-[#4F46E5]' : 'border-slate-300'}`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
                  )}
                </div>
                <span>{opcao.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seção: Input da Chave */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Chave
        </label>
        <div className="relative flex items-center">
          <Mail className="absolute left-4 w-5 h-5 text-slate-700 stroke-[1.8]" />
          <input
            type="text"
            placeholder="Digite sua chave PIX"
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-[#4F46E5] text-slate-800 transition-colors"
          />
        </div>
      </div>

      {/* Seção: Conta para recebimento */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Conta para recebimento
        </label>
        <button 
          type="button"
          className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-sm font-medium text-slate-800 hover:border-slate-300 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-slate-700 stroke-[1.8]" />
            <span>Conta Corrente ****1234</span>
          </div>
          <ChevronDown className="w-5 h-5 text-slate-800 stroke-[2]" />
        </button>
      </div>

      {/* Botão de Ação Principal */}
      <button
        type="button"
        className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium py-4 rounded-xl text-sm transition-colors mt-2 shadow-sm"
      >
        Validar chave
      </button>

    </div>


        {/* Conteúdo do Formulário */}
        <div className="flex-1">
          {/* Seus componentes de input e validação entram aqui */}
        </div>

      </main>
    </div>
  );
}
