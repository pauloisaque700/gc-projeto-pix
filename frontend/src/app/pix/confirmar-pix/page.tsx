"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";
import Card from "../../../components/Card";
import BotaoGrande from "../../../components/BotaoGrande";
import { ApiError, buscarConta, resolverChavePix, transferirPix, type ChavePixResolvida, type Conta } from "../../../lib/api";
import { formatarMoeda, limparRascunhoPix, obterRascunhoPix, rotuloConta, salvarRascunhoPix, type RascunhoPix } from "../../../lib/pix";
import { obterSessaoLocal, type SessaoLocal } from "../../../lib/session";
import { useDadosDaSessao } from "../../../lib/use-dados-da-sessao";

interface Confirmacao {
  rascunho: RascunhoPix;
  origem: Conta;
  destino: ChavePixResolvida;
}

async function prepararConfirmacao(rascunho: RascunhoPix, sessao: SessaoLocal): Promise<Confirmacao | null> {
  const [origem, destino] = await Promise.all([
    buscarConta(rascunho.contaOrigemId),
    resolverChavePix(rascunho.chaveDestino),
  ]);
  if (obterSessaoLocal() !== sessao) return null;
  if (origem.usuarioId !== rascunho.usuarioId || origem.status !== "ATIVA") {
    throw new Error("Selecione uma conta de origem ativa da sua sessão.");
  }
  if (origem.id === destino.contaId) {
    throw new Error("Não é possível transferir para a própria conta.");
  }
  const contaDestino = await buscarConta(destino.contaId);
  if (contaDestino.status !== "ATIVA") {
    throw new Error("A conta do destinatário está bloqueada.");
  }
  return { rascunho, origem, destino };
}

export default function ConfirmarPix() {
  const router = useRouter();
  const { sessao, dados, erro: erroSessao, recarregar } = useDadosDaSessao();
  const sessaoDaConfirmacao = useRef<SessaoLocal | null>(null);

  useEffect(() => {
    if (sessaoDaConfirmacao.current && sessaoDaConfirmacao.current !== sessao) {
      router.replace("/tela-principal");
    } else if (dados) {
      sessaoDaConfirmacao.current = sessao;
    }
  }, [dados, router, sessao]);

  return <ConfirmacaoPix key={sessao.versao} sessao={sessao} usuarioId={dados?.usuario.id}
    erroSessao={erroSessao} recarregar={recarregar} />;
}

function ConfirmacaoPix({ sessao, usuarioId, erroSessao, recarregar }: {
  sessao: SessaoLocal;
  usuarioId?: string;
  erroSessao: string | null;
  recarregar: () => void;
}) {
  const router = useRouter();
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const [carregamento, setCarregamento] = useState<"pendente" | "pronto" | "falhou">("pendente");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultadoIncerto, setResultadoIncerto] = useState(false);
  const envioOcupado = useRef(false);
  const confirmacaoAtiva = useRef(false);

  useEffect(() => {
    if (!usuarioId || obterSessaoLocal() !== sessao) return;
    let ativo = true;
    confirmacaoAtiva.current = true;
    async function carregar(id: string) {
      try {
        const rascunho = obterRascunhoPix(id);
        if (!rascunho) throw new Error("Preencha os dados da transferência antes de confirmar.");
        const revisao = await prepararConfirmacao(rascunho, sessao);
        if (revisao && ativo && obterSessaoLocal() === sessao) {
          setConfirmacao(revisao);
          setCarregamento("pronto");
        }
      } catch (error) {
        if (ativo && obterSessaoLocal() === sessao) {
          setCarregamento("falhou");
          setErro(error instanceof Error ? error.message : "Não foi possível preparar a transferência.");
        }
      }
    }
    void carregar(usuarioId);
    return () => {
      ativo = false;
      confirmacaoAtiva.current = false;
    };
  }, [sessao, usuarioId]);

  function podeEnviar(origem: Conta, rascunho: RascunhoPix) {
    if (!confirmacaoAtiva.current) return false;
    const atual = obterSessaoLocal();
    if (atual === sessao && atual.usuarioId === rascunho.usuarioId && origem.usuarioId === atual.usuarioId) return true;

    router.replace("/tela-principal");
    return false;
  }

  function confirmacaoContinuaNaSessao() {
    return confirmacaoAtiva.current && obterSessaoLocal() === sessao;
  }

  async function confirmar() {
    if (!confirmacao || envioOcupado.current || resultadoIncerto) return;
    const rascunho = confirmacao.rascunho;
    if (!podeEnviar(confirmacao.origem, rascunho)) return;

    envioOcupado.current = true;
    setEnviando(true);
    setErro(null);

    let envioIniciado = false;
    let concluido = false;
    try {
      const atual = await prepararConfirmacao(rascunho, sessao);
      if (!atual || !podeEnviar(atual.origem, rascunho)) return;
      if (atual.destino.chaveId !== confirmacao.destino.chaveId
        || atual.destino.contaId !== confirmacao.destino.contaId
        || atual.destino.nomeTitular !== confirmacao.destino.nomeTitular) {
        setConfirmacao(atual);
        setErro("O destinatário mudou. Confira os dados atualizados antes de confirmar.");
        return;
      }

      limparRascunhoPix();
      if (!podeEnviar(atual.origem, rascunho)) return;
      envioIniciado = true;
      const transferencia = await transferirPix({
        contaOrigemId: atual.origem.id,
        chaveDestino: atual.destino.valor,
        valor: rascunho.valor,
      });
      if (!confirmacaoContinuaNaSessao()) return;
      concluido = true;
      router.replace(`/pix/pix-realizado?id=${encodeURIComponent(transferencia.id)}`);
    } catch (error) {
      if (!confirmacaoContinuaNaSessao()) return;
      if (envioIniciado && (!(error instanceof ApiError) || error.status >= 500)) {
        setResultadoIncerto(true);
        setErro("Não foi possível confirmar o resultado. Consulte o extrato antes de tentar novamente.");
      } else {
        if (envioIniciado) {
          try { salvarRascunhoPix(rascunho); } catch { /* Os dados permanecem disponíveis nesta tela. */ }
        }
        setErro(error instanceof Error ? error.message : "Não foi possível realizar a transferência.");
      }
    } finally {
      if (!concluido && confirmacaoContinuaNaSessao()) {
        envioOcupado.current = false;
        setEnviando(false);
      }
    }
  }

  return (
    <Tela>
      <SmartphoneHeader title="Confirmar PIX" backToUrl={enviando ? "" : "/pix/transferir-pix"} />
      <div className="flex flex-col gap-4">
        {!erroSessao && carregamento === "pendente" && <p role="status">Consultando os dados do PIX...</p>}
        {erroSessao && (
          <>
            <p role="alert" className="text-sm text-red-600">{erroSessao}</p>
            <BotaoGrande text="Tentar novamente" onClick={recarregar} />
          </>
        )}
        {confirmacao && (
          <Card>
            <div className="text-center">
              <p className="text-sm text-slate-500">Valor a transferir</p>
              <strong className="text-3xl text-slate-900">{formatarMoeda(confirmacao.rascunho.valor)}</strong>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt>Para</dt><dd className="text-right font-semibold">{confirmacao.destino.nomeTitular}</dd></div>
              <div className="flex justify-between gap-4"><dt>Chave PIX</dt><dd className="break-all text-right">{confirmacao.destino.valor}</dd></div>
              <div className="flex justify-between gap-4"><dt>Origem</dt><dd className="text-right">{rotuloConta(confirmacao.origem)}</dd></div>
            </dl>
          </Card>
        )}
        {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
        {resultadoIncerto && confirmacao && (
          <Link href={`/conta/historico-transacoes?contaId=${encodeURIComponent(confirmacao.origem.id)}`}
            className="text-sm font-semibold text-indigo-700">Consultar extrato</Link>
        )}
        {confirmacao && !resultadoIncerto && (
          <BotaoGrande text="Confirmar PIX" isLoading={enviando} onClick={confirmar} />
        )}
      </div>
    </Tela>
  );
}
