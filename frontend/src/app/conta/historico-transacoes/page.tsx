"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";
import CardTransferencias from "../../../components/CardTransferencias";
import { formatarDataPix, linkDetalhesPix, rotuloConta } from "../../../lib/pix";
import { useDadosDaSessao } from "../../../lib/use-dados-da-sessao";
import { useExtratoPix } from "../../../lib/use-extrato-pix";

export default function TransacoesDaContaPage() {
  return (
    <Suspense fallback={<Tela><p role="status">Carregando extrato...</p></Tela>}>
      <ExtratoDaRota />
    </Suspense>
  );
}

function diaLocal(instante: string) {
  const data = new Date(instante);
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

function ExtratoDaRota() {
  const contaId = useSearchParams().get("contaId");
  const { dados, erro: erroSessao, recarregar } = useDadosDaSessao();
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const conta = contaId === null ? dados?.contas[0] : dados?.contas.find((item) => item.id === contaId);
  const extrato = useExtratoPix(conta?.id);
  const itens = extrato?.itens.filter((item) => {
    const dia = diaLocal(item.realizadaEm);
    return (!dataInicial || dia >= dataInicial) && (!dataFinal || dia <= dataFinal);
  });

  return (
    <Tela>
      <SmartphoneHeader title="Transações da Conta" backToUrl="/tela-principal" />
      {!dados && !erroSessao && <p role="status">Carregando suas contas...</p>}
      {erroSessao && (
        <>
          <p role="alert" className="text-sm text-red-600">{erroSessao}</p>
          <button type="button" className="mt-3 text-sm text-indigo-700" onClick={recarregar}>Tentar novamente</button>
        </>
      )}
      {dados && !conta && (
        <p className="text-sm text-slate-600">
          {contaId === null ? "Você ainda não possui conta bancária." : "Esta conta não está disponível nesta sessão."}
        </p>
      )}
      {conta && (
        <>
          <p className="mb-3 text-sm text-slate-700">{rotuloConta(conta)}</p>
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
          {!extrato && <p role="status">Carregando extrato...</p>}
          {extrato?.erro && <p role="alert" className="text-sm text-red-600">{extrato.erro}</p>}
          {extrato && !extrato.erro && itens?.length === 0 && (
            <p className="text-sm text-slate-600">Nenhum PIX encontrado nesse período.</p>
          )}
          <section className="flex flex-col gap-1">
            {itens?.map((item) => {
              const recebido = item.contaDestinoId === conta.id;
              return (
                <Link key={item.id} href={linkDetalhesPix(item.id, conta.id)}>
                  <CardTransferencias
                    title={recebido ? "PIX recebido" : "PIX enviado"}
                    description={item.origemExterna ?? item.chaveDestinoUtilizada}
                    amount={recebido ? item.valor : -item.valor}
                    date={formatarDataPix(item.realizadaEm)}
                  />
                </Link>
              );
            })}
          </section>
        </>
      )}
    </Tela>
  );
}
