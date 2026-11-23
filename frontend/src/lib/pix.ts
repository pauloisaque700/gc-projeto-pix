import type { Conta, TipoChavePix, TransferenciaPix, TransferirPixRequest } from "./api";

export interface RascunhoPix extends TransferirPixRequest {
  usuarioId: string;
}

const CHAVE_RASCUNHO = "byebank:pixPendente";
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export const ROTULOS_TIPO_CHAVE_PIX: Readonly<Record<TipoChavePix, string>> = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  EMAIL: "E-mail",
  TELEFONE: "Telefone",
  ALEATORIA: "Chave aleatória",
};

export function formatarMoeda(valor: number) {
  return moeda.format(valor);
}

export function formatarDataPix(instante: string) {
  return dataHora.format(new Date(instante));
}

export function rotuloConta(conta: Conta) {
  const tipo = conta.tipoConta === "CORRENTE" ? "Corrente" : "Poupança";
  return `${tipo} · Ag ${conta.agencia} · Conta ${conta.numero}`;
}

function valorPixValido(valor: number) {
  return Number.isFinite(valor) && valor > 0
    && /^\d+(?:\.\d{1,2})?$/.test(String(valor))
    && Number.isSafeInteger(Math.round(valor * 100));
}

export function valorDigitadoPix(texto: string): number | null {
  const valor = texto.trim();
  const formatoBrasileiro = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/;
  const formatoDecimal = /^\d+\.\d{1,2}$/;
  if (!formatoBrasileiro.test(valor) && !formatoDecimal.test(valor)) return null;

  const convertido = Number(formatoBrasileiro.test(valor) ? valor.replace(/\./g, "").replace(",", ".") : valor);
  return valorPixValido(convertido) ? convertido : null;
}

export function salvarRascunhoPix(rascunho: RascunhoPix) {
  sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(rascunho));
}

export function obterRascunhoPix(usuarioId: string): RascunhoPix | null {
  try {
    const armazenado = sessionStorage.getItem(CHAVE_RASCUNHO);
    if (!armazenado) return null;
    const rascunho: Partial<RascunhoPix> | null = JSON.parse(armazenado);
    if (rascunho?.usuarioId === usuarioId && typeof rascunho.contaOrigemId === "string"
      && typeof rascunho.chaveDestino === "string" && rascunho.chaveDestino.trim()
      && typeof rascunho.valor === "number" && valorPixValido(rascunho.valor)) {
      return {
        usuarioId,
        contaOrigemId: rascunho.contaOrigemId,
        chaveDestino: rascunho.chaveDestino,
        valor: rascunho.valor,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function limparRascunhoPix() {
  sessionStorage.removeItem(CHAVE_RASCUNHO);
}

export function pixMaisRecentes(transferencias: TransferenciaPix[]) {
  return [...transferencias].sort((a, b) => Date.parse(b.realizadaEm) - Date.parse(a.realizadaEm));
}

export function linkDetalhesPix(id: string, contaId?: string) {
  const consulta = new URLSearchParams({ id });
  if (contaId) consulta.set("contaId", contaId);
  return `/pix/detalhes-pix?${consulta}`;
}
