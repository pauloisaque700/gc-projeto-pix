"use client";

import { useState } from 'react';
import { CreditCard, ChevronDown } from 'lucide-react';

interface Conta {
  id: string;
  label: string;
}

interface DropdownProps {
  options: Conta[];
  onSelect?: (conta: Conta) => void;
}

export default function Dropdown({ options, onSelect }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Conta>(options[0]);

  const handleSelect = (option: Conta) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  return (
    <div className="w-full font-sans relative">
      {/* Botão de disparo do Dropdown */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 bg-white border rounded-xl flex items-center justify-between text-sm font-medium text-slate-800 transition-all text-left focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]
          ${isOpen ? 'border-[#4F46E5] ring-1 ring-[#4F46E5]' : 'border-slate-200 hover:border-slate-300'}`}
      >
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          <span>{selectedOption.label}</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-slate-500 stroke-2 transition-transform duration-200 
            ${isOpen ? 'rotate-180 text-[#4F46E5]' : ''}`} 
        />
      </button>

      {/* Menu flutuante de opções */}
      {isOpen && (
        <div className="absolute top-[54px] left-0 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
          {options.map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              onClick={() => handleSelect(opcao)}
              className={`w-full px-4 py-3 text-sm text-left transition-colors flex items-center gap-3
                ${selectedOption.id === opcao.id 
                  ? 'bg-slate-50 text-[#4F46E5] font-semibold' 
                  : 'text-slate-700 hover:bg-slate-50'}`}
            >
              <CreditCard className={`w-4 h-4 stroke-[1.8] ${selectedOption.id === opcao.id ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
              {opcao.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
