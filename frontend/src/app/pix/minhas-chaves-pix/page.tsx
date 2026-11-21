"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Hook de navegação do Next.js App Router
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";
import Card from "../../../components/Card";
import BotaoGrande from "../../../components/BotaoGrande";
import { User, Mail, ChevronRight, Shield, Plus, RotateCw, Phone, FileText } from "lucide-react";

// 1. Definição do Tipo de Dado exato que o seu Backend vai retornar
interface ChavePix {
  id: string;
  tipo: 'cpf' | 'cnpj' | 'email' | 'telefone';
  valor: string;
  conta: string;
  status: string;
}

export default function MinhasChavesPix() {
  const router = useRouter(); // Instancia o roteador do Next.js
  
  // 2. Estados de controle para a Integração do Backend
  const [chaves, setChaves] = useState<ChavePix[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. Função que fará a busca Real dos dados no seu Servidor
  useEffect(() => {
    async function carregarChavesDoBackend() {
      try {
        setLoading(true);
        
        // Exemplo de chamada real futuramente:
        // const response = await fetch('https://seuapp.com');
        // const dados = await response.json();
        // setChaves(dados);

        // Simulando o retorno do Banco de Dados com atraso de rede
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const dadosSimulados: ChavePix[] = [
          { id: "1", tipo: "cpf", valor: "123.456.789-00", conta: "Conta: ****1234", status: "Ativa" },
          { id: "2", tipo: "email", valor: "usuario@email.com", conta: "Conta: ****1234", status: "Em Análise" },
          { id: "3", tipo: "email", valor: "usuario@email.com", conta: "Conta: ****1234", status: "Suspensa" }
        ];
        
        setChaves(dadosSimulados);
      } catch (error) {
        console.error("Erro ao buscar chaves Pix do banco:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarChavesDoBackend();
  }, []);

  // 4. Função auxiliar para renderizar o ícone correto baseado no tipo da chave do banco
  const obterIconeChave = (tipo: string) => {
    const classes = "w-5 h-5 text-[#4F46E5] stroke-[1.8]";
    switch (tipo) {
      case 'cpf': return <User className={classes} />;
      case 'cnpj': return <FileText className={classes} />;
      case 'telefone': return <Phone className={classes} />;
      default: return <Mail className={classes} />;
    }
  };

  // Função auxiliar para formatar o rótulo do tipo da chave (ex: CPF, E-mail)
  const obterNomeTipoChave = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'cpf': return 'CPF';
      case 'cnpj': return 'CNPJ';
      case 'email': return 'E-mail';
      case 'telefone': return 'Telefone';
      default: return tipo;
    }
  };

  // Função auxiliar para estilizar a tag de status conforme o retorno do backend
  const obterEstiloStatus = (status: string) => {
    const statusNormalizado = status.toLowerCase().trim();

    if (statusNormalizado === 'ativa') {
      return "bg-[#E6FDF9] text-[#0D9488]";
    }
    if (statusNormalizado === 'em análise' || statusNormalizado === 'em analise' || statusNormalizado === 'pendente') {
      return "bg-[#FEF3C7] text-[#D97706]";
    }
    if (statusNormalizado === 'suspensa' || statusNormalizado === 'bloqueada') {
      return "bg-[#FEE2E2] text-[#DC2626]";
    }

    return "bg-slate-100 text-slate-600";
  };

  // Ação ao clicar em uma chave (fácil de integrar com as rotas do backend)
  const handleSelecionarChave = (chave: ChavePix) => {
    const statusNormalizado = chave.status.toLowerCase().trim();

    if (statusNormalizado === 'suspensa') {
      router.push('/pix/chave-pix-suspensa');
      return;
    }

    // Rota padrão para detalhes/gerenciamento da chave
    router.push(`/pix/minhas-chaves-pix/${chave.id}`);
  };

  return (
    <Tela>
      <SmartphoneHeader title="Minhas Chaves PIX" backToUrl="/tela-principal" />

      <div className="flex flex-col gap-6 px-1 py-2 font-sans w-full max-w-[400px]">
        
        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold text-slate-700">Chaves cadastradas</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Use suas chaves PIX para receber transferências em tempo real na sua conta ByeBank de forma rápida e segura.
          </p>
        </div>

        {/* 5. Feedback Visual de Carregamento (Skeleton/Spinner) enquanto a API responde */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Se o banco voltar sem nenhuma chave cadastrada */}
            {chaves.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Nenhuma chave cadastrada ainda.</p>
            )}

            {/* Listagem Renderizada Dinamicamente com dados do Banco */}
            {chaves.map((chave) => (
              <Card 
                key={chave.id}
                paddingClass="p-4"
                roundedClass="rounded-2xl"
                borderClass="border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
              >
                <button 
                  type="button"
                  onClick={() => handleSelecionarChave(chave)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                      {obterIconeChave(chave.tipo)}
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">
                          {obterNomeTipoChave(chave.tipo)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${obterEstiloStatus(chave.status)}`}>
                          {chave.status}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-800 mt-0.5">{chave.valor}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">{chave.conta}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0 stroke-[1.8]" />
                </button>
              </Card>
            ))}
          </div>
        )}

        <div className="bg-[#F5F3FF] border border-[#EDE9FE] rounded-2xl p-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#6D28D9] shrink-0 stroke-[1.8]" />
          <p className="text-[11px] text-[#6D28D9] font-medium leading-relaxed">
            Suas chaves PIX estão criptografadas e protegidas pelo Banco Central.
          </p>
        </div>

        <div className="flex flex-col gap-1 mt-2">
          {/* 6. BOTÃO LINKADO: Navega para a página de criação usando o router.push */}
          <BotaoGrande 
            text="Adicionar chave"
            bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
            textClass="text-white font-semibold"
            widthClass="w-full"
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            onClick={() => router.push('/pix/adicionar-chave')}
          />
          <BotaoGrande 
            text="Gerar chave aleatória"
            bgClass="bg-white hover:bg-slate-50/50"
            borderClass="border border-slate-200"
            textClass="text-[#4F46E5] font-semibold"
            widthClass="w-full"
            icon={<RotateCw className="w-4 h-4 stroke-[2.2]" />}
            onClick={() => console.log("Ação de gerar chave aleatória")}
          />
        </div>

      </div>
    </Tela>
  );
}
