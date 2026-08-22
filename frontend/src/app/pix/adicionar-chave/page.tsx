"use client";

import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";
import Card from "../../../components/Card";
import Radio from "../../../components/Radio";
import Input from "../../../components/Input";
import Dropdown from "../../../components/DropDown";
import BotaoGrande from "../../../components/BotaoGrande";
import { User, Building2, Phone, Mail } from "lucide-react";
import { useState } from "react";
import Tag from "@/src/components/Tag";

export default function AdicionarChave() {
    const [tipoChave, setTipoChave] = useState('email');
    const opcoesChave = [
        { id: 'cpf', label: 'CPF' },
        { id: 'cnpj', label: 'CNPJ' },
        { id: 'email', label: 'E-mail' },
        { id: 'telefone', label: 'Telefone' },
    ];
    const contasDisponiveis = [
        { id: '1', label: 'Conta Corrente ****1234' },
        { id: '2', label: 'Conta Poupança ****5678' },
        { id: '3', label: 'Conta Salário ****9900' },
    ];

  return (
    <Tela>
        <SmartphoneHeader title="Adicionar Chave PIX" backToUrl="/pix" />
        <Card>
            <Tag label="PASSO 1 DE 2" variant="blue" />
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                    Tipo de chave
                </label>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
                <Radio id="cpf" label="CPF" isSelected={tipoChave === 'cpf'} onClick={() => setTipoChave('cpf')} />
                <Radio id="cnpj" label="CNPJ" isSelected={tipoChave === 'cnpj'} onClick={() => setTipoChave('cnpj')} />
                <Radio id="email" label="E-mail" isSelected={tipoChave === 'email'} onClick={() => setTipoChave('email')} />
                <Radio id="telefone" label="Telefone" isSelected={tipoChave === 'telefone'} onClick={() => setTipoChave('telefone')} />
            </div>
            {/* 2. A Tela organiza e renderiza o Input correto baseado na seleção */}
            {tipoChave === 'cpf' && (
                <Input 
                label="CPF" 
                placeholder="000.000.000-00" 
                icon={<User className="w-5 h-5 stroke-[1.8]" />} 
                />
            )}
            {tipoChave === 'cnpj' && (
                <Input 
                label="CNPJ" 
                placeholder="00.000.000/0000-00" 
                icon={<Building2 className="w-5 h-5 stroke-[1.8]" />} 
                />
            )}
            {tipoChave === 'email' && (
                <Input 
                label="E-mail" 
                placeholder="Digite seu e-mail" 
                icon={<Mail className="w-5 h-5 stroke-[1.8]" />} 
                type="email"
                />
            )}
            {tipoChave === 'telefone' && (
                <Input 
                label="Telefone" 
                placeholder="(00) 00000-0000" 
                icon={<Phone className="w-5 h-5 stroke-[1.8]" />} 
                type="tel"
                />
            )}

            {/* Seção: Conta para recebimento */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                Conta para recebimento
                </label>
                <Dropdown  
                    options={contasDisponiveis} 
                    onSelect={(conta) => console.log('Conta selecionada:', conta)}
                />
                <BotaoGrande 
                    text="Validar chave" 
                    bgClass="bg-[#4F46E5] hover:bg-[#4338CA]" // Roxo/Azul vibrante exato do print
                    textClass="text-white font-semibold"       // font-semibold deixa o texto firme como na imagem
                    widthClass="w-full"                        // Ocupa a largura total do card
                    onClick={() => console.log('Validar chave clicado')}
                />
            </div>
        </Card>
    </Tela>
  );
}
