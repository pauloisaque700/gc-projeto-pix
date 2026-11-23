"use client"
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, CreditCard, ChevronDown, AlertCircle, User, Phone } from 'lucide-react'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import Card from '../../../components/Card'
import Input from '../../../components/Input'
import BotaoGrande from '../../../components/BotaoGrande'
import { buscarConta, ApiError } from '../../../lib/api'

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Card from "@/src/components/Card";
import SmartphoneHeader from "@/src/components/SmartphoneHeader";
import Tela from "@/src/components/Tela";
import {
  ApiError,
  associarChavePix,
  gerarChavePixAleatoria,
  listarContasDoUsuario,
  validarChavePix,
  type ChavePixResponse,
  type Conta,
  type TipoChavePix,
} from "@/src/lib/api";
import { obterUsuarioLogado } from "@/src/lib/session";

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
  const [contas, setContas] = useState<Conta[]>([]);
  const [contaId, setContaId] = useState("");
  const [tipo, setTipo] = useState<TipoChavePix>("EMAIL");
  const [valor, setValor] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [falhaAoCarregar, setFalhaAoCarregar] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [chaveCriada, setChaveCriada] = useState<ChavePixResponse | null>(null);

  useEffect(() => {
    let ativo = true;
    async function carregarContas() {
      try {
        const usuarioId = obterUsuarioLogado();
        if (!usuarioId) {
          throw new Error("Entre na sua conta para cadastrar uma chave PIX.");
        }
        const contasDoUsuario = await listarContasDoUsuario(usuarioId);
        if (ativo) {
          setContas(contasDoUsuario);
          if (contasDoUsuario.length === 1) setContaId(contasDoUsuario[0].id);
        }
      } catch (error) {
        if (ativo) {
          setFalhaAoCarregar(error instanceof Error ? error.message : "Não foi possível carregar suas contas.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarContas();
    return () => { ativo = false; };
  }, []);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando || !contaId) return;

    setErro(null);
    setEnviando(true);
    try {
      if (tipo === "ALEATORIA") {
        setChaveCriada(await gerarChavePixAleatoria(contaId));
        return;
      }

      const validacao = await validarChavePix({ tipo, valor: valor.trim() });
      if (!validacao.valida) {
        setErro("O valor informado é inválido para o tipo de chave selecionado.");
        return;
      }
      if (!validacao.disponivelParaAssociacao) {
        setErro("Esta chave PIX já está cadastrada.");
        return;
      }

      setChaveCriada(await associarChavePix({ contaId, tipo, valor: validacao.valorNormalizado }));
    } catch (error) {
      const mensagem = error instanceof ApiError
        ? Object.values(error.campos)[0] ?? error.message
        : error instanceof Error ? error.message : "Não foi possível cadastrar a chave PIX.";
      setErro(mensagem);
    } finally {
      setEnviando(false);
    }
  }

  const contaAssociada = contas.find((conta) => conta.id === chaveCriada?.contaId);

  return (
    <Tela>
      <SmartphoneHeader title="Adicionar Chave PIX" backToUrl="/pix/minhas-chaves-pix" />
      <Card>
        {carregando && <p role="status">Carregando suas contas...</p>}
        {falhaAoCarregar && <p role="alert" className="text-sm text-red-600">{falhaAoCarregar}</p>}
        {!carregando && !falhaAoCarregar && contas.length === 0 && (
          <p className="text-sm text-slate-700">
            Você precisa de uma conta bancária para cadastrar uma chave PIX.{" "}
            <Link href="/conta/criar-conta-bancaria" className="font-semibold text-indigo-700 underline">
              Criar conta
            </Link>
          </p>
        )}

        {chaveCriada ? (
          <div role="status" className="space-y-2 text-sm text-slate-700">
            <h2 className="text-base font-semibold text-emerald-700">Chave PIX cadastrada</h2>
            <p>{ROTULOS_TIPO[chaveCriada.tipo]}</p>
            <p className="break-all font-semibold">{chaveCriada.valor}</p>
            {contaAssociada && <p>{identificarConta(contaAssociada)}</p>}
          </div>
        ) : contas.length > 0 && (
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
        )}
      </Card>
    </Tela>
  );
}
