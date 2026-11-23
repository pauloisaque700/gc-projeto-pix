"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Card from "@/src/components/Card";
import SmartphoneHeader from "@/src/components/SmartphoneHeader";
import Tela from "@/src/components/Tela";
import {
  ApiError,
  associarChavePix,
  gerarChavePixAleatoria,
  validarChavePix,
  type ChavePixResponse,
  type Conta,
  type TipoChavePix,
} from "@/src/lib/api";
import { obterSessaoLocal, type SessaoLocal } from "@/src/lib/session";
import { useDadosDaSessao } from "@/src/lib/use-dados-da-sessao";

const ROTULOS_TIPO: Record<TipoChavePix, string> = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  EMAIL: "E-mail",
  TELEFONE: "Telefone",
  ALEATORIA: "Chave aleatória",
};

const estiloCampo = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500";
const estiloBotao = "w-full rounded-xl bg-indigo-600 py-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60";

function identificarConta(conta: Conta) {
  const tipo = conta.tipoConta === "CORRENTE" ? "Corrente" : "Poupança";
  return `${tipo} · Agência ${conta.agencia} · Conta ${conta.numero}`;
}

export default function AdicionarChavePix() {
  const { sessao, dados, erro, recarregar } = useDadosDaSessao();
  const contas = dados?.contas.filter((conta) => conta.usuarioId === sessao.usuarioId) ?? [];

  return (
    <Tela>
      <SmartphoneHeader title="Adicionar Chave PIX" backToUrl="/pix/minhas-chaves-pix" />
      <Card>
        {!dados && !erro && <p role="status">Carregando suas contas...</p>}
        {erro && <>
          <p role="alert" className="text-sm text-red-600">{erro}</p>
          <button type="button" className={estiloBotao} onClick={recarregar}>Tentar novamente</button>
        </>}
        {dados && contas.length === 0 && (
          <p className="text-sm text-slate-700">
            Você precisa de uma conta bancária para cadastrar uma chave PIX.{" "}
            <Link href="/conta/criar-conta-bancaria" className="font-semibold text-indigo-700 underline">
              Criar conta
            </Link>
          </p>
        )}
        {contas.length > 0 && <FormularioChavePix key={sessao.versao} sessao={sessao} contas={contas} />}
      </Card>
    </Tela>
  );
}

function FormularioChavePix({ sessao, contas }: { sessao: SessaoLocal; contas: Conta[] }) {
  const [contaId, setContaId] = useState(contas.length === 1 ? contas[0].id : "");
  const [tipo, setTipo] = useState<TipoChavePix>("EMAIL");
  const [valor, setValor] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [chaveCriada, setChaveCriada] = useState<ChavePixResponse | null>(null);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sessaoValida = () => obterSessaoLocal() === sessao;
    if (enviando || !sessaoValida() || !contas.some((conta) => conta.id === contaId)) return;

    setErro(null);
    setEnviando(true);
    try {
      let chave: ChavePixResponse;
      if (tipo === "ALEATORIA") {
        chave = await gerarChavePixAleatoria(contaId);
      } else {
        const validacao = await validarChavePix({ tipo, valor: valor.trim() });
        if (!sessaoValida()) return;
        if (!validacao.valida) {
          setErro("O valor informado é inválido para o tipo de chave selecionado.");
          return;
        }
        if (!validacao.disponivelParaAssociacao) {
          setErro("Esta chave PIX já está cadastrada.");
          return;
        }

        chave = await associarChavePix({ contaId, tipo, valor: validacao.valorNormalizado });
      }
      if (sessaoValida()) setChaveCriada(chave);
    } catch (error) {
      if (!sessaoValida()) return;
      const mensagem = error instanceof ApiError
        ? Object.values(error.campos)[0] ?? error.message
        : error instanceof Error ? error.message : "Não foi possível cadastrar a chave PIX.";
      setErro(mensagem);
    } finally {
      if (sessaoValida()) setEnviando(false);
    }
  }

  const contaAssociada = contas.find((conta) => conta.id === chaveCriada?.contaId);

  return chaveCriada ? (
    <div role="status" className="space-y-2 text-sm text-slate-700">
      <h2 className="text-base font-semibold text-emerald-700">Chave PIX cadastrada</h2>
      <p>{ROTULOS_TIPO[chaveCriada.tipo]}</p>
      <p className="break-all font-semibold">{chaveCriada.valor}</p>
      {contaAssociada && <p>{identificarConta(contaAssociada)}</p>}
    </div>
  ) : (
    <form onSubmit={cadastrar}>
      <fieldset disabled={enviando} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="conta-pix" className="text-sm font-semibold text-slate-700">Conta para recebimento</label>
          <select id="conta-pix" className={estiloCampo} required value={contaId} onChange={(event) => {
            setContaId(event.target.value);
            setErro(null);
          }}>
            <option value="">Selecione uma conta</option>
            {contas.map((conta) => <option key={conta.id} value={conta.id}>{identificarConta(conta)}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="tipo-chave" className="text-sm font-semibold text-slate-700">Tipo de chave</label>
          <select id="tipo-chave" className={estiloCampo} value={tipo} onChange={(event) => {
            setTipo(event.target.value as TipoChavePix);
            setValor("");
            setErro(null);
          }}>
            {Object.entries(ROTULOS_TIPO).map(([tipoChave, rotulo]) => (
              <option key={tipoChave} value={tipoChave}>{rotulo}</option>
            ))}
          </select>
        </div>

        {tipo !== "ALEATORIA" && (
          <div className="space-y-2">
            <label htmlFor="valor-chave" className="text-sm font-semibold text-slate-700">{ROTULOS_TIPO[tipo]}</label>
            <input id="valor-chave" className={estiloCampo} required value={valor} onChange={(event) => {
              setValor(event.target.value);
              setErro(null);
            }} />
          </div>
        )}

        {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
        <button type="submit" className={estiloBotao} disabled={!contaId || (tipo !== "ALEATORIA" && !valor.trim())}>
          {enviando ? "Cadastrando..." : tipo === "ALEATORIA" ? "Gerar chave aleatória" : "Cadastrar chave PIX"}
        </button>
      </fieldset>
    </form>
  );
}
