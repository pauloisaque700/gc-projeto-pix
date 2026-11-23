"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, FileText, KeyRound, Mail, Phone, Plus, RotateCw, User, type LucideIcon } from "lucide-react";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";
import Card from "../../../components/Card";
import BotaoGrande from "../../../components/BotaoGrande";
import { ApiError, gerarChavePixAleatoria, listarChavesPixDaConta, type ChavePixResponse, type Conta, type TipoChavePix } from "../../../lib/api";
import { ROTULOS_TIPO_CHAVE_PIX, rotuloConta } from "../../../lib/pix";
import { obterSessaoLocal, type SessaoLocal } from "../../../lib/session";
import { useDadosDaSessao, type DadosDaSessao } from "../../../lib/use-dados-da-sessao";

const ICONES_TIPO_CHAVE_PIX: Record<TipoChavePix, LucideIcon> = {
  CPF: User,
  CNPJ: FileText,
  EMAIL: Mail,
  TELEFONE: Phone,
  ALEATORIA: KeyRound,
};

interface ResultadoChaves {
  dadosDaSessao: DadosDaSessao;
  itens: { chave: ChavePixResponse; conta: Conta }[];
  erro: string | null;
}

type GeracaoChave = { sessao: SessaoLocal } & (
  | { estado: "enviando" }
  | { estado: "confirmada" | "falhou" | "incerta"; mensagem: string }
);

export default function MinhasChavesPix() {
  const router = useRouter();
  const { sessao, dados, erro: erroSessao, recarregar } = useDadosDaSessao();
  const [resultado, setResultado] = useState<ResultadoChaves | null>(null);
  const [selecao, setSelecao] = useState<{ sessao: SessaoLocal; contaId: string } | null>(null);
  const [geracao, setGeracao] = useState<GeracaoChave | null>(null);
  const geracoesPendentes = useRef(new Set<string>());
  const contas = useMemo(() => dados?.contas.filter((conta) => conta.usuarioId === dados.usuario.id) ?? [], [dados]);

  useEffect(() => {
    if (!dados || obterSessaoLocal() !== sessao) return;
    let ativo = true;
    const sessaoValida = () => ativo && obterSessaoLocal() === sessao;

    async function carregar(dadosDaSessao: DadosDaSessao) {
      try {
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
  }, [contas, dados, sessao]);

  const atual = resultado?.dadosDaSessao === dados ? resultado : null;
  const erro = erroSessao ?? atual?.erro;
  const geracaoAtual = geracao?.sessao === sessao ? geracao : null;
  const enviando = geracaoAtual?.estado === "enviando";
  const contaSelecionada = contas.length === 1 ? contas[0]
    : contas.find((conta) => selecao?.sessao === sessao && selecao.contaId === conta.id);

  async function gerarChave() {
    const usuarioId = sessao.usuarioId;
    if (!usuarioId || !contaSelecionada || !atual || erro || enviando || geracoesPendentes.current.has(usuarioId)
      || obterSessaoLocal() !== sessao) return;

    geracoesPendentes.current.add(usuarioId);
    setGeracao({ sessao, estado: "enviando" });
    try {
      const chave = await gerarChavePixAleatoria(contaSelecionada.id);
      if (obterSessaoLocal() !== sessao) return;
      if (chave?.contaId !== contaSelecionada.id || chave.tipo !== "ALEATORIA") {
        throw new Error("Resposta inválida ao cadastrar a chave PIX.");
      }

      setGeracao({ sessao, estado: "confirmada", mensagem: "Chave PIX aleatória cadastrada com sucesso." });
      recarregar();
    } catch (error) {
      if (obterSessaoLocal() !== sessao) return;
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        setGeracao({ sessao, estado: "falhou", mensagem: Object.values(error.campos)[0] ?? error.message });
      } else {
        setGeracao({
          sessao,
          estado: "incerta",
          mensagem: "Não foi possível confirmar o cadastro. Confira a lista de chaves antes de tentar novamente.",
        });
        recarregar();
      }
    } finally {
      geracoesPendentes.current.delete(usuarioId);
    }
  }

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
            <p role="alert" className="text-sm text-red-600">
              {geracaoAtual?.estado === "confirmada" && "Não foi possível atualizar a lista de chaves. "}
              {erro}
            </p>
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
              const Icone = ICONES_TIPO_CHAVE_PIX[chave.tipo];
              return (
                <Link
                  key={chave.id}
                  href={`/pix/minhas-chaves-pix/${encodeURIComponent(chave.id)}?contaId=${encodeURIComponent(conta.id)}`}
                  className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  <Card
                    paddingClass="p-4"
                    roundedClass="rounded-2xl"
                    borderClass="border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                        <Icone aria-hidden="true" className="w-5 h-5 text-[#4F46E5] stroke-[1.8]" />
                      </div>
                      <div className="flex flex-1 flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-700">{ROTULOS_TIPO_CHAVE_PIX[chave.tipo]}</span>
                        <span className="text-sm font-bold text-slate-800 mt-0.5 break-all">{chave.valor}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">{rotuloConta(conta)}</span>
                      </div>
                      <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>
                  </Card>
                </Link>
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
          {contas.length > 1 && (
            <label className="mt-2 flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Conta para a chave aleatória
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
                value={contaSelecionada?.id ?? ""}
                disabled={enviando || !atual || Boolean(erro)}
                onChange={(event) => {
                  setSelecao({ sessao, contaId: event.target.value });
                  if (geracaoAtual?.estado === "falhou") setGeracao(null);
                }}
              >
                <option value="">Selecione uma conta</option>
                {contas.map((conta) => <option key={conta.id} value={conta.id}>{rotuloConta(conta)}</option>)}
              </select>
            </label>
          )}
          {contas.length === 1 && <p className="mt-2 text-sm text-slate-700">Conta para a chave aleatória: {rotuloConta(contas[0])}</p>}
          {dados && contas.length === 0 && <p className="mt-2 text-sm text-slate-700">Crie uma conta bancária para gerar uma chave PIX.</p>}
          <BotaoGrande
            text="Gerar chave aleatória"
            bgClass="bg-white hover:bg-slate-50/50"
            borderClass="border border-slate-200"
            textClass="text-[#4F46E5] font-semibold"
            widthClass="w-full"
            icon={<RotateCw className="w-4 h-4 stroke-[2.2]" />}
            isLoading={enviando}
            disabled={!contaSelecionada || !atual || Boolean(erro)}
            onClick={gerarChave}
          />
          {geracaoAtual && geracaoAtual.estado !== "enviando" && (
            <p role={geracaoAtual.estado === "confirmada" ? "status" : "alert"} className={
              geracaoAtual.estado === "confirmada" ? "text-sm text-emerald-700" : "text-sm text-red-600"
            }>{geracaoAtual.mensagem}</p>
          )}
        </div>
      </div>
    </Tela>
  );
}
