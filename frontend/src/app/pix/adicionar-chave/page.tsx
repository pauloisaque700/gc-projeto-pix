"use client";

import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";
import Card from "../../../components/Card";
import Radio from "../../../components/Radio";
import Input from "../../../components/Input";
import Dropdown from "../../../components/DropDown";
import BotaoGrande from "../../../components/BotaoGrande";
import { User, Building2, Phone, Mail, CheckCircle2, ShieldCheck, AlertCircle, RotateCw} from "lucide-react";
import { useState } from "react";
import Tag from "@/src/components/Tag";

export default function AdicionarChave() {
    const [passo, setPasso] = useState(1);
    const [tipoChave, setTipoChave] = useState('email');

    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const opcoesChave = [
        { id: 'cpf', label: 'CPF' },
        { id: 'cnpj', label: 'CNPJ' },
        { id: 'email', label: 'E-mail' },
        { id: 'telefone', label: 'Telefone' },
    ];
    const [chaveSelecionada, setChaveSelecionada] = useState<{ id: string; label: string; value?: string }>(opcoesChave[2]); // Padrão: E-mail
    const contasDisponiveis = [
        { id: '1', label: 'Conta Corrente ****1234' },
        { id: '2', label: 'Conta Poupança ****5678' },
        { id: '3', label: 'Conta Salário ****9900' },
    ];
    const [contaSelecionada, setContaSelecionada] = useState(contasDisponiveis[0]);

    const handleValidarChave = async () => {
        
    setLoading(true);
    setErro(null); // Limpa mensagens de erro anteriores

    try {
        const valorDigitado = chaveSelecionada.value?.trim() || "";

        // 1. Validação Preventiva Básica (Campo Vazio)
        if (!valorDigitado) {
            throw new Error("Por favor, preencha o campo da chave PIX.");
        }

        // Remove pontos, traços, barras e parênteses para validar números limpos
        const apenasNumeros = valorDigitado.replace(/\D/g, "");

        // 2. Validações específicas para cada Tipo de Chave
        if (tipoChave === 'cpf') {
            if (apenasNumeros.length !== 11) {
                throw new Error("O CPF deve conter exatamente 11 dígitos numéricos.");
            }
        } 
        else if (tipoChave === 'cnpj') {
            if (apenasNumeros.length !== 14) {
                throw new Error("O CNPJ deve conter exatamente 14 dígitos numéricos.");
            }
        } 
        else if (tipoChave === 'email') {
            // Regex básico e performático para validação de formato de e-mail
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(valorDigitado)) {
                throw new Error("O formato do e-mail digitado é inválido (ex: nome@email.com).");
            }
        } 
        else if (tipoChave === 'telefone') {
            // Aceita formatos de telefone com DDD (10 ou 11 dígitos no total)
            if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
                throw new Error("O telefone deve conter o DDD seguido de 8 ou 9 dígitos.");
            }
        }
        // 3. Simulação de Erro de Regra de Negócio (Banco de Dados / API)
        if (valorDigitado.toLowerCase() === "erro@email.com" || apenasNumeros === "11111111111") {
            throw new Error("Esta chave PIX já está cadastrada nesta ou em outra instituição.");
        }
        // 4. Simulação de atraso de rede (Chamada da API real)
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // APENAS se nenhuma validação acima lançar erro, a tela avança
        setPasso(2);
    } catch (err: any) {
        // O código cai aqui imediatamente caso qualquer 'throw new Error' seja acionado
        setErro(err.message || "Ocorreu um erro ao validar a chave. Tente novamente.");
    } finally {
        // Desativa o estado de carregamento do botão
        setLoading(false);
    }
};

  return (
    <Tela>
    {passo == 1 && <SmartphoneHeader title="Adicionar Chave PIX" backToUrl="/pix" />}
    {passo == 1 && (
        <Card>
            <Tag label="PASSO 1 DE 2" variant="blue" />
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                    Tipo de chave
                </label>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
                <Radio id="cpf" label="CPF" isSelected={tipoChave === 'cpf'} onClick={() => {setTipoChave('cpf'); setChaveSelecionada({ id: 'cpf', label: 'CPF', value: '' });}} />
                <Radio id="cnpj" label="CNPJ" isSelected={tipoChave === 'cnpj'} onClick={() => {setTipoChave('cnpj'); setChaveSelecionada({ id: 'cnpj', label: 'CNPJ', value: '' });}} />
                <Radio id="email" label="E-mail" isSelected={tipoChave === 'email'} onClick={() => {setTipoChave('email'); setChaveSelecionada({ id: 'email', label: 'E-mail', value: '' });}} />
                <Radio id="telefone" label="Telefone" isSelected={tipoChave === 'telefone'} onClick={() => {setTipoChave('telefone'); setChaveSelecionada({ id: 'telefone', label: 'Telefone', value: '' });}} />
            </div>
            {/* 2. A Tela organiza e renderiza o Input correto baseado na seleção */}
            {tipoChave === 'cpf' && (
                <Input 
                    label="CPF" 
                    placeholder="000.000.000-00" 
                    icon={<User className="w-5 h-5 stroke-[1.8]" />} 
                    value={chaveSelecionada.value || ''}
                    onChange={(e) => setChaveSelecionada({ ...chaveSelecionada, value: e.target.value })}
                />
            )}
            {tipoChave === 'cnpj' && (
                <Input 
                    label="CNPJ" 
                    placeholder="00.000.000/0000-00" 
                    icon={<Building2 className="w-5 h-5 stroke-[1.8]" />} 
                    value={chaveSelecionada.value || ''}
                    onChange={(e) => setChaveSelecionada({ ...chaveSelecionada, value: e.target.value })}
                />
            )}
            {tipoChave === 'email' && (
                <Input 
                    label="E-mail" 
                    placeholder="Digite seu e-mail" 
                    icon={<Mail className="w-5 h-5 stroke-[1.8]" />} 
                    type="email"
                    value={chaveSelecionada.value || ''}
                    onChange={(e) => setChaveSelecionada({ ...chaveSelecionada, value: e.target.value })}
                />
            )}
            {tipoChave === 'telefone' && (
                <Input 
                    label="Telefone" 
                    placeholder="(00) 00000-0000" 
                    icon={<Phone className="w-5 h-5 stroke-[1.8]" />} 
                    type="tel"
                    value={chaveSelecionada.value || ''}
                    onChange={(e) => setChaveSelecionada({ ...chaveSelecionada, value: e.target.value })}
                />
            )}

            {/* Seção: Conta para recebimento */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                    Conta para recebimento
                </label>
                <Dropdown  
                    options={contasDisponiveis} 
                    onSelect={(conta) => { setContaSelecionada(conta); }}
                />
                {/* O CARD DE ERRO FICA EXATAMENTE AQUI: */}
                {erro && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700 animate-in fade-in duration-200 mt-2">
                        {/* Ícone de alerta vermelho alinhado à esquerda */}
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[2]" />
                        
                        <div className="flex flex-col gap-1">
                            <span className="font-bold">Ajuste necessário</span>
                            <p className="text-xs text-red-600 leading-relaxed">
                                {erro} Por favor, verifique e altere o campo acima.
                            </p>
                        </div>
                    </div>
                )}
                <BotaoGrande 
                    text="Validar chave" 
                    bgClass="bg-[#4F46E5] hover:bg-[#4338CA]" // Roxo/Azul vibrante exato do print
                    textClass="text-white font-semibold"       // font-semibold deixa o texto firme como na imagem
                    widthClass="w-full"                        // Ocupa a largura total do card
                    isLoading={loading} // Passa o estado de loading para exibir o spinner interno
                    disabled={!chaveSelecionada.value || loading} // Desativa se estiver vazio ou carregando
                    onClick={handleValidarChave}
                />
            </div>
        </Card>
        )}

        {passo == 2 && (
        <Card>
        <Tag label="PASSO 2: CONFIRMAÇÃO" variant="green" />
            <Card bgClass="bg-[#E6FDF9]" borderClass="border border-[#CCFBF1]"paddingClass="p-4" roundedClass="rounded-2xl">
                <div className="flex items-center gap-2 text-[#0D9488] font-bold text-base">
                    <CheckCircle2 className="w-5 h-5 fill-[#0D9488] text-white stroke-[2]" />
                    <span>Chave válida</span>
                </div>

                {/* Linha Divisória Fina */}
                <div className="w-full h-[1px] bg-[#CCFBF1]" />

                {/* Informações da Chave e Conta */}
                <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-slate-500">Chave:</span>
                    <span className="font-bold text-slate-800">{chaveSelecionada.value}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-500">Conta:</span>
                    <span className="font-bold text-slate-800">{contaSelecionada.label}</span>
                </div>
                </div>
            </Card>

      {/* 3. Banner de Segurança Roxo Sutil */}
            <div className="bg-[#F5F3FF] border border-[#EDE9FE] rounded-2xl p-4 flex items-start gap-3 font-sans">
                <ShieldCheck className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5 stroke-[1.8]" />
                <p className="text-xs text-[#6D28D9] leading-relaxed">
                Seus dados estão protegidos por criptografia ponta a ponta.
                </p>
            </div>

      {/* 4. Botão Principal de Confirmação */}
            <BotaoGrande 
                text="Confirmar associação" 
                bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
                textClass="text-white font-semibold"
                widthClass="w-full"
                onClick={() => console.log("Associação Pix Confirmada!")}
            />
        </Card>
        )}
    </Tela>
  );
}
