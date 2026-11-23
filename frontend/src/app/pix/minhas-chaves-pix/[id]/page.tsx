"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Card from "../../../../components/Card";
import SmartphoneHeader from "../../../../components/SmartphoneHeader";
import Tela from "../../../../components/Tela";
import { listarChavesPixDaConta, type ChavePixResponse, type Conta } from "../../../../lib/api";
import { formatarDataPix, ROTULOS_TIPO_CHAVE_PIX, rotuloConta } from "../../../../lib/pix";
import { obterSessaoLocal } from "../../../../lib/session";
import { useDadosDaSessao } from "../../../../lib/use-dados-da-sessao";

interface ResultadoChave {
  conta: Conta;
  chave: ChavePixResponse | null;
  erro: string | null;
}

const carregando = <p role="status" className="text-sm text-slate-600">Carregando detalhes da chave PIX...</p>;

export default function DetalhesChavePix() {
  return (
    <Tela>
      <SmartphoneHeader title="Detalhes da chave PIX" backToUrl="/pix/minhas-chaves-pix" />
      <Suspense fallback={carregando}>
        <ChaveSelecionada />
      </Suspense>
    </Tela>
  );
}

function ChaveSelecionada() {
  const { id } = useParams<{ id: string }>();
  const contaId = useSearchParams().get("contaId");
  return <ConsultaDaChave key={`${id}:${contaId ?? ""}`} id={id} contaId={contaId} />;
}

function ConsultaDaChave({ id, contaId }: { id: string; contaId: string | null }) {
  const { sessao, dados, erro: erroSessao, recarregar } = useDadosDaSessao();
  const conta = dados?.contas.find((item) => item.id === contaId && item.usuarioId === dados.usuario.id);
  const [resultado, setResultado] = useState<ResultadoChave | null>(null);

  useEffect(() => {
    if (!conta || obterSessaoLocal() !== sessao) return;
    let ativo = true;
    const sessaoValida = () => ativo && obterSessaoLocal() === sessao;

    async function consultar(contaConsultada: Conta) {
      try {
        const chaves = await listarChavesPixDaConta(contaConsultada.id);
        if (!sessaoValida()) return;
        const chave = chaves.find((item) => item.id === id && item.contaId === contaConsultada.id) ?? null;
        setResultado({ conta: contaConsultada, chave, erro: null });
      } catch (error) {
        if (!sessaoValida()) return;
        const mensagem = error instanceof Error ? error.message : "Não foi possível consultar a chave PIX.";
        setResultado({ conta: contaConsultada, chave: null, erro: mensagem });
      }
    }

    void consultar(conta);
    return () => { ativo = false; };
  }, [conta, id, sessao]);

  const atual = resultado?.conta === conta ? resultado : null;
  const erro = erroSessao ?? atual?.erro;

  if (erro) {
    return (
      <div className="flex flex-col gap-2">
        <p role="alert" className="text-sm text-red-600">{erro}</p>
        <button type="button" className="text-sm font-semibold text-indigo-700" onClick={recarregar}>
          Tentar novamente
        </button>
      </div>
    );
  }
  if (dados && !conta) {
    return <p role="status" className="text-sm text-slate-600">Selecione uma chave vinculada a uma conta da sua sessão na lista de chaves PIX.</p>;
  }
  if (!atual) return carregando;

  const { chave } = atual;
  if (!chave) return <p role="status" className="text-sm text-slate-600">Chave PIX não encontrada nesta conta.</p>;

  return (
    <Card>
      <dl className="space-y-4 text-sm text-slate-700">
        <div>
          <dt className="text-slate-500">Tipo de chave</dt>
          <dd className="font-semibold">{ROTULOS_TIPO_CHAVE_PIX[chave.tipo]}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Chave PIX</dt>
          <dd className="break-all font-semibold">{chave.valor}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Conta vinculada</dt>
          <dd className="font-semibold">{rotuloConta(atual.conta)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Data de cadastro</dt>
          <dd className="font-semibold"><time dateTime={chave.criadaEm}>{formatarDataPix(chave.criadaEm)}</time></dd>
        </div>
      </dl>
    </Card>
  );
}
