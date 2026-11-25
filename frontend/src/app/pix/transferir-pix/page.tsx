"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DollarSign, Search } from "lucide-react";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";
import Card from "../../../components/Card";
import Input from "../../../components/Input";
import { formatarMoeda, obterRascunhoPix, rotuloConta, salvarRascunhoPix, valorDigitadoPix } from "../../../lib/pix";
import { obterSessaoLocal, type SessaoLocal } from "../../../lib/session";
import { useDadosDaSessao, type DadosDaSessao } from "../../../lib/use-dados-da-sessao";

export default function TransferirPix() {
  const { sessao, dados, erro: erroSessao, recarregar } = useDadosDaSessao();

  return (
    <Tela>
      <SmartphoneHeader title="TRANSFERIR PIX" backToUrl="/tela-principal" />
      <Card paddingClass="p-5">
        {!dados && !erroSessao && <p role="status">Carregando suas contas...</p>}
        {erroSessao && (
          <>
            <p role="alert" className="text-sm text-red-600">{erroSessao}</p>
            <button type="button" className="text-sm text-indigo-700" onClick={recarregar}>Tentar novamente</button>
          </>
        )}
        {dados && <FormularioPix key={sessao.versao} dados={dados} sessao={sessao} />}
      </Card>
    </Tela>
  );
}

function FormularioPix({ dados, sessao }: { dados: DadosDaSessao; sessao: SessaoLocal }) {
  const router = useRouter();
  const usuarioId = dados.usuario.id;
  const [rascunho] = useState(() => obterRascunhoPix(usuarioId));
  const [contaId, setContaId] = useState(rascunho?.contaOrigemId ?? "");
  const [chaveDestino, setChaveDestino] = useState(rascunho?.chaveDestino ?? "");
  const [valorTexto, setValorTexto] = useState(rascunho ? String(rascunho.valor).replace(".", ",") : "");
  const [erro, setErro] = useState<string | null>(null);

  const contasAtivas = dados.contas.filter((conta) => conta.status === "ATIVA" && conta.usuarioId === usuarioId);
  const contaOrigem = contasAtivas.find((conta) => conta.id === contaId)
    ?? (!contaId && contasAtivas.length === 1 ? contasAtivas[0] : undefined);

  function continuar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (obterSessaoLocal() !== sessao || !contaOrigem) return;

    const chave = chaveDestino.trim();
    const valor = valorDigitadoPix(valorTexto);
    if (!chave || valor === null) {
      setErro("Informe a chave de destino e um valor positivo com até duas casas decimais.");
      return;
    }

    try {
      salvarRascunhoPix({ usuarioId, contaOrigemId: contaOrigem.id, chaveDestino: chave, valor });
      router.push("/pix/confirmar-pix");
    } catch {
      setErro("Não foi possível guardar os dados para confirmar o PIX neste navegador.");
    }
  }

  if (contasAtivas.length === 0) {
    return (
      <p className="text-sm text-slate-700">
        Você precisa de uma conta ativa para transferir.{" "}
        <Link href="/conta/minhas-contas-bancarias" className="font-semibold text-indigo-700">Minhas Contas</Link>
      </p>
    );
  }

  return (
    <form onSubmit={continuar} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="conta-origem" className="text-sm font-semibold text-slate-700">Origem da transferência</label>
        <select
          id="conta-origem"
          value={contaOrigem?.id ?? ""}
          onChange={(event) => setContaId(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
        >
          <option value="">Selecione uma conta</option>
          {contasAtivas.map((conta) => <option key={conta.id} value={conta.id}>{rotuloConta(conta)}</option>)}
        </select>
        {contaOrigem && (
          <p className="text-xs text-slate-600">
            Saldo disponível {formatarMoeda(contaOrigem.saldo)} · Limite diário {formatarMoeda(contaOrigem.limiteDiario)}
          </p>
        )}
      </div>
      <Input
        label="Chave PIX do destinatário"
        placeholder="E-mail, CPF, CNPJ, celular ou chave aleatória"
        icon={<Search className="h-5 w-5" />}
        value={chaveDestino}
        onChange={(event) => setChaveDestino(event.target.value)}
      />
      <Input
        label="Quanto deseja transferir?"
        placeholder="0,00"
        icon={<DollarSign className="h-5 w-5" />}
        value={valorTexto}
        onChange={(event) => setValorTexto(event.target.value)}
      />
      <p className="text-xs text-slate-600">A API oferece PIX imediato. Agendamento está indisponível.</p>
      {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/tela-principal" className="rounded-xl border border-slate-200 py-4 text-center text-sm font-semibold text-slate-600">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={!contaOrigem || !chaveDestino.trim() || !valorTexto.trim()}
          className="rounded-xl bg-indigo-600 py-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          Continuar
        </button>
      </div>
    </form>
  );
}
