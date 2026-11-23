"use client";

import { useEffect, useMemo, useState } from "react";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";
import CardTransferencias from "../../../components/CardTransferencias";
import { listarExtratoPix, type TransferenciaPix } from "../../../lib/api";
import { formatarDataPix, formatarMoeda, pixMaisRecentes, rotuloConta } from "../../../lib/pix";
import { obterSessaoLocal, type SessaoLocal } from "../../../lib/session";
import { useDadosDaSessao, type DadosDaSessao } from "../../../lib/use-dados-da-sessao";

type ResultadoRelatorio = { itens: TransferenciaPix[]; erro: null } | { itens: null; erro: string };

function diaLocal(instante: string) {
  const data = new Date(instante);
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export default function TransacoesPage() {
  const { sessao, dados, erro, recarregar } = useDadosDaSessao();

  return (
    <Tela>
      <SmartphoneHeader title="Relatório de transações PIX" backToUrl="/conta/minhas-contas-bancarias" />
      {!dados && !erro && <p role="status">Carregando suas contas...</p>}
      {erro && <FalhaRelatorio mensagem={erro} recarregar={recarregar} />}
      {dados && <RelatorioPix key={sessao.versao} dados={dados} sessao={sessao} recarregar={recarregar} />}
    </Tela>
  );
}

function FalhaRelatorio({ mensagem, recarregar }: { mensagem: string; recarregar: () => void }) {
  return (
    <>
      <p role="alert" className="text-sm text-red-600">{mensagem}</p>
      <button type="button" className="mt-3 text-sm font-semibold text-indigo-700" onClick={recarregar}>
        Tentar novamente
      </button>
    </>
  );
}

function RelatorioPix({ dados, sessao, recarregar }: {
  dados: DadosDaSessao;
  sessao: SessaoLocal;
  recarregar: () => void;
}) {
  const contas = useMemo(() => dados.contas.filter((conta) => conta.usuarioId === dados.usuario.id), [dados]);
  const [resultado, setResultado] = useState<ResultadoRelatorio | null>(null);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  useEffect(() => {
    if (!contas.length || obterSessaoLocal() !== sessao) return;
    let ativo = true;
    const sessaoValida = () => ativo && obterSessaoLocal() === sessao;

    async function carregar() {
      try {
        const extratos = await Promise.all(contas.map(async (conta) => {
          const itens = await listarExtratoPix(conta.id);
          return itens.filter((item) => item.contaOrigemId === conta.id || item.contaDestinoId === conta.id);
        }));
        if (!sessaoValida()) return;
        const porId = new Map(extratos.flat().map((item) => [item.id, item]));
        setResultado({ itens: pixMaisRecentes([...porId.values()]), erro: null });
      } catch (error) {
        if (!sessaoValida()) return;
        const mensagem = error instanceof Error ? error.message : "Não foi possível carregar o relatório PIX.";
        setResultado({ itens: null, erro: mensagem });
      }
    }

    void carregar();
    return () => { ativo = false; };
  }, [contas, sessao]);

  if (contas.length === 0) return <p className="text-sm text-slate-600">Você ainda não possui conta bancária.</p>;
  if (!resultado) return <p role="status">Carregando transações PIX...</p>;
  if (resultado.erro !== null) return <FalhaRelatorio mensagem={resultado.erro} recarregar={recarregar} />;

  const contasPorId = new Map(contas.map((conta) => [conta.id, conta]));
  const periodoInvalido = Boolean(dataInicial && dataFinal && dataInicial > dataFinal);
  const itens = resultado.itens.filter((item) => {
    const dia = diaLocal(item.realizadaEm);
    return (!dataInicial || dia >= dataInicial) && (!dataFinal || dia <= dataFinal);
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <label className="flex flex-col gap-1">
          Data inicial
          <input type="date" value={dataInicial} onChange={(event) => setDataInicial(event.target.value)}
            className="rounded-lg border border-slate-200 p-2" />
        </label>
        <label className="flex flex-col gap-1">
          Data final
          <input type="date" value={dataFinal} onChange={(event) => setDataFinal(event.target.value)}
            className="rounded-lg border border-slate-200 p-2" />
        </label>
      </div>
      {periodoInvalido ? (
        <p role="alert" className="text-sm text-red-600">A data inicial deve ser anterior ou igual à data final.</p>
      ) : (
        <section className="flex-1 flex flex-col w-full mt-2">
          {itens.length === 0 && <p className="text-sm text-slate-600">Nenhum PIX encontrado nesse período.</p>}
          {itens.map((item) => {
            const origem = contasPorId.get(item.contaOrigemId ?? "");
            const destino = contasPorId.get(item.contaDestinoId);
            const data = formatarDataPix(item.realizadaEm);

            if (origem && destino) {
              return (
                <div key={item.id} className="flex justify-between gap-3 border-b border-slate-200 py-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">PIX entre suas contas</p>
                    <p className="text-xs text-slate-600">De {rotuloConta(origem)} para {rotuloConta(destino)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-slate-900">{formatarMoeda(item.valor)}</p>
                    <time dateTime={item.realizadaEm} className="text-xs text-slate-500">{data}</time>
                  </div>
                </div>
              );
            }

            const conta = destino ?? origem;
            if (!conta) return null;
            const contraparte = item.origemExterna ?? item.chaveDestinoUtilizada;
            return (
              <CardTransferencias
                key={item.id}
                title={destino ? "PIX recebido" : "PIX enviado"}
                description={`${rotuloConta(conta)} · ${contraparte}`}
                amount={destino ? item.valor : -item.valor}
                date={data}
              />
            );
          })}
        </section>
      )}
    </>
  );
}
