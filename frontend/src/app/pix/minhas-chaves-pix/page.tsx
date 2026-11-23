"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, KeyRound, Mail, Phone, Plus, RotateCw, User, type LucideIcon } from "lucide-react";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";
import Card from "../../../components/Card";
import BotaoGrande from "../../../components/BotaoGrande";
import { listarChavesPixDaConta, type ChavePixResponse, type Conta, type TipoChavePix } from "../../../lib/api";
import { rotuloConta } from "../../../lib/pix";
import { obterSessaoLocal } from "../../../lib/session";
import { useDadosDaSessao, type DadosDaSessao } from "../../../lib/use-dados-da-sessao";

const TIPOS_CHAVE: Record<TipoChavePix, { rotulo: string; Icone: LucideIcon }> = {
  CPF: { rotulo: "CPF", Icone: User },
  CNPJ: { rotulo: "CNPJ", Icone: FileText },
  EMAIL: { rotulo: "E-mail", Icone: Mail },
  TELEFONE: { rotulo: "Telefone", Icone: Phone },
  ALEATORIA: { rotulo: "Chave aleatória", Icone: KeyRound },
};

interface ResultadoChaves {
  dadosDaSessao: DadosDaSessao;
  itens: { chave: ChavePixResponse; conta: Conta }[];
  erro: string | null;
}

export default function MinhasChavesPix() {
  const router = useRouter();
  const { sessao, dados, erro: erroSessao, recarregar } = useDadosDaSessao();
  const [resultado, setResultado] = useState<ResultadoChaves | null>(null);

  useEffect(() => {
    if (!dados || obterSessaoLocal() !== sessao) return;
    let ativo = true;
    const sessaoValida = () => ativo && obterSessaoLocal() === sessao;

    async function carregar(dadosDaSessao: DadosDaSessao) {
      try {
        const contas = dadosDaSessao.contas.filter((conta) => conta.usuarioId === dadosDaSessao.usuario.id);
        const chavesPorConta = await Promise.all(contas.map(async (conta) => {
          const chaves = await listarChavesPixDaConta(conta.id);
          return chaves
            .filter((chave) => chave.contaId === conta.id)
            .map((chave) => ({ chave, conta }));
        }));
        if (sessaoValida()) setResultado({ dadosDaSessao, itens: chavesPorConta.flat(), erro: null });
      } catch (error) {
        if (sessaoValida()) {
          const mensagem = error instanceof Error ? error.message : "Não foi possível carregar as chaves PIX.";
          setResultado({ dadosDaSessao, itens: [], erro: mensagem });
        }
      }
    }

    void carregar(dados);
    return () => { ativo = false; };
  }, [dados, sessao]);

  const atual = resultado?.dadosDaSessao === dados ? resultado : null;
  const erro = erroSessao ?? atual?.erro;

  return (
    <Tela>
      <SmartphoneHeader title="Minhas Chaves PIX" backToUrl="/tela-principal" />

      <div className="flex flex-col gap-6 px-1 py-2 font-sans w-full max-w-[400px]">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold text-slate-700">Chaves cadastradas</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Consulte as chaves PIX vinculadas às suas contas ByeBank.
          </p>
        </div>

        {!erro && !atual && (
          <div role="status" aria-label="Carregando chaves PIX" className="flex justify-center items-center py-8">
            <div aria-hidden="true" className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
          </div>
        )}
        {erro && (
          <div className="flex flex-col gap-2">
            <p role="alert" className="text-sm text-red-600">{erro}</p>
            <button type="button" className="text-sm font-semibold text-indigo-700" onClick={recarregar}>
              Tentar novamente
            </button>
          </div>
        )}
        {!erro && atual && (
          <div className="flex flex-col gap-4">
            {atual.itens.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Nenhuma chave cadastrada ainda.</p>
            )}
            {atual.itens.map(({ chave, conta }) => {
              const { rotulo, Icone } = TIPOS_CHAVE[chave.tipo];
              return (
                <Card
                  key={chave.id}
                  paddingClass="p-4"
                  roundedClass="rounded-2xl"
                  borderClass="border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                      <Icone aria-hidden="true" className="w-5 h-5 text-[#4F46E5] stroke-[1.8]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-700">{rotulo}</span>
                      <span className="text-sm font-bold text-slate-800 mt-0.5 break-all">{chave.valor}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">{rotuloConta(conta)}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-1 mt-2">
          <BotaoGrande
            text="Adicionar chave"
            bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
            textClass="text-white font-semibold"
            widthClass="w-full"
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            onClick={() => router.push("/pix/adicionar-chave")}
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
