import React from 'react';
import { Search, Wallet, User } from 'lucide-react';

export default function PixTransfer() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-[375px] bg-white rounded-3xl p-6 font-sans shadow-sm select-none">
        
        {/* Origem da transferência */}
        <div className="mb-6">
          <h2 className="text-gray-900 font-semibold text-[15px] mb-2">
            Origem da transferência
          </h2>
          <div className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-900 font-medium text-[14px] leading-tight">
                  Conta Corrente
                </p>
                <p className="text-gray-400 text-[12px] mt-0.5">
                  Saldo: R$ 1.500,00
                </p>
              </div>
            </div>
            <span className="text-[12px] font-medium text-gray-400">
              ByeBank
            </span>
          </div>
        </div>

        {/* Chave PIX */}
        <div className="mb-6">
          <h2 className="text-gray-900 font-semibold text-[15px] mb-2">
            Chave PIX do destinatário
          </h2>
          <div className="relative flex items-center border border-gray-200 rounded-2xl bg-white px-4 py-3.5">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="E-mail, CPF, celular ou chave aleatória"
              className="w-full text-[14px] text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Quanto deseja transferir */}
        <div className="mb-6">
          <h2 className="text-gray-900 font-semibold text-[15px] mb-2">
            Quanto deseja transferir?
          </h2>
          <div className="border-2 border-indigo-600 rounded-2xl p-4 bg-white flex items-center">
            <span className="text-indigo-600 font-bold text-xl mr-2">R$</span>
            <input
              type="text"
              defaultValue="250,00"
              className="w-full text-gray-900 font-bold text-xl outline-none bg-transparent"
            />
          </div>
          <p className="text-gray-400 text-[11px] mt-2 tracking-wide">
            Limite operacional restante: R$ 5.000,00
          </p>
        </div>

        {/* Contatos Recentes */}
        <div>
          <h3 className="text-gray-400 font-bold text-[11px] tracking-wider mb-3">
            CONTATOS RECENTES
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            
            {/* João */}
            <button className="flex items-center gap-2 border border-gray-100 bg-white rounded-full py-1.5 pl-1.5 pr-4 shadow-sm hover:bg-gray-50 transition-colors shrink-0">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                JS
              </div>
              <span className="text-gray-900 font-medium text-[13px]">João</span>
            </button>

            {/* Maria */}
            <button className="flex items-center gap-2 border border-gray-100 bg-white rounded-full py-1.5 pl-1.5 pr-4 shadow-sm hover:bg-gray-50 transition-colors shrink-0">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                MO
              </div>
              <span className="text-gray-900 font-medium text-[13px]">Maria</span>
            </button>

            {/* Carlos */}
            <button className="flex items-center gap-2 border border-gray-100 bg-white rounded-full py-1.5 pl-1.5 pr-4 shadow-sm hover:bg-gray-50 transition-colors shrink-0">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                CR
              </div>
              <span className="text-gray-900 font-medium text-[13px]">Carlos</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
