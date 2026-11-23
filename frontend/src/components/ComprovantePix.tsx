"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { buscarConta, buscarTransferenciaPix, type Conta, type TransferenciaPix } from "../lib/api";
import { formatarDataPix, formatarMoeda, linkDetalhesPix } from "../lib/pix";
import { obterSessaoLocal, type SessaoLocal } from "../lib/session";
import { useDadosDaSessao, type DadosDaSessao } from "../lib/use-dados-da-sessao";
import BotaoGrande from "./BotaoGrande";
import Card from "./Card";
import SmartphoneHeader from "./SmartphoneHeader";
import Tela from "./Tela";

interface OperacaoPix {
  transferencia: TransferenciaPix;
  enviado: boolean;
  nomeContraparte: string;
  contaId: string;
}

export default function ComprovantePix({ sucesso = false }: { sucesso?: boolean }) {
  return (
    <Suspense fallback={<Tela><p role="status">Carregando transferência...</p></Tela>}>
      <ComprovanteDaRota sucesso={sucesso} />
    </Suspense>
  );
}

function ComprovanteDaRota({ sucesso }: { sucesso: boolean }) {
  const consulta = useSearchParams();
  const { sessao, dados, erro: erroSessao, recarregar } = useDadosDaSessao();
  const id = consulta.get("id");
  const contaId = consulta.get("contaId");
  return <Comprovante key={`${sessao.versao}:${consulta}`} id={id} contaId={contaId} sucesso={sucesso}
    sessao={sessao} dados={dados} erroSessao={erroSessao} recarregar={recarregar} />;
}

function Comprovante({ id, contaId, sucesso, sessao, dados, erroSessao, recarregar }: {
  id: string | null;
  contaId: string | null;
  sucesso: boolean;
  sessao: SessaoLocal;
  dados: DadosDaSessao | null;
  erroSessao: string | null;
  recarregar: () => void;
}) {
  const [operacao, setOperacao] = useState<OperacaoPix | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !dados || obterSessaoLocal() !== sessao) return;
    let ativo = true;
    const sessaoValida = () => ativo && obterSessaoLocal() === sessao;
    async function carregar(transferenciaId: string, contas: Conta[]) {
      try {
        const transferencia = await buscarTransferenciaPix(transferenciaId);
        if (!sessaoValida()) return;
        const origem = contas.find((conta) => conta.id === transferencia.contaOrigemId);
        const destino = contas.find((conta) => conta.id === transferencia.contaDestinoId);
        const conta = contaId !== null
          ? [origem, destino].find((item) => item?.id === contaId)
          : origem ?? destino;
        const enviado = conta?.id === transferencia.contaOrigemId;
        if (!conta || (sucesso && !enviado)) {
          throw new Error("A transferência não está disponível para as contas desta sessão.");
        }
        const contraparteId = enviado ? transferencia.contaDestinoId : transferencia.contaOrigemId;
        const nomeContraparte = contraparteId
          ? (await buscarConta(contraparteId)).nomeTitular
          : transferencia.origemExterna ?? "Origem externa";
        if (sessaoValida()) setOperacao({ transferencia, enviado, nomeContraparte, contaId: conta.id });
      } catch (error) {
        if (sessaoValida()) setErro(error instanceof Error ? error.message : "Não foi possível consultar a transferência.");
      }
    }
    void carregar(id, dados.contas);
    return () => { ativo = false; };
  }, [id, contaId, sucesso, sessao, dados]);

  const mensagem = erroSessao ?? (!id ? "Informe uma transferência para consultar o comprovante." : erro);
  const volta = operacao && !sucesso
    ? `/conta/historico-transacoes?contaId=${encodeURIComponent(operacao.contaId)}`
    : "/tela-principal";

  return (
    <Tela>
      <SmartphoneHeader title={sucesso && operacao ? "PIX realizado" : "Detalhes do PIX"} backToUrl={volta} />
      {mensagem && <p role="alert" className="text-sm text-red-600">{mensagem}</p>}
      {erroSessao && <BotaoGrande text="Tentar novamente" onClick={recarregar} />}
      {!operacao && !mensagem && <p role="status">Carregando transferência...</p>}
      {operacao && (
        <div className="flex flex-col gap-4">
          {sucesso && (
            <div role="status" className="flex items-center gap-2 text-emerald-700">
              <Check className="h-6 w-6" /> Transferência executada com sucesso.
            </div>
          )}
          <Card>
            <div className="text-center">
              <p className="text-sm text-slate-500">{operacao.enviado ? "Valor enviado" : "Valor recebido"}</p>
              <strong className="text-3xl text-slate-900">{formatarMoeda(operacao.transferencia.valor)}</strong>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt>{operacao.enviado ? "Destinatário" : "Remetente"}</dt>
                <dd className="text-right font-semibold">{operacao.nomeContraparte}</dd>
              </div>
              <div className="flex justify-between gap-4"><dt>Chave PIX</dt><dd className="break-all text-right">{operacao.transferencia.chaveDestinoUtilizada}</dd></div>
              <div className="flex justify-between gap-4"><dt>Data e hora</dt><dd className="text-right">{formatarDataPix(operacao.transferencia.realizadaEm)}</dd></div>
              <div className="flex justify-between gap-4"><dt>ID da transação</dt><dd className="break-all text-right">{operacao.transferencia.id}</dd></div>
            </dl>
          </Card>
          {sucesso ? (
            <>
              <Link href={linkDetalhesPix(operacao.transferencia.id, operacao.contaId)} className="text-center text-sm font-semibold text-indigo-700">
                Ver detalhes da transferência
              </Link>
              <Link href="/tela-principal" className="rounded-xl bg-indigo-600 py-4 text-center text-sm font-semibold text-white">Voltar ao início</Link>
            </>
          ) : <p className="text-xs text-slate-600">A solicitação de estorno está indisponível na API atual.</p>}
        </div>
      )}
    </Tela>
  );
}
