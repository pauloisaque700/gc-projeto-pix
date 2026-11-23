// Client central de acesso à API do backend (Spring Boot).
// Mantém os tipos alinhados com os DTOs em backend/src/main/java/com/byebank/pix/api.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface ErroApi {
  instante: string;
  status: number;
  erro: string;
  mensagem: string;
  campos: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  campos: Record<string, string>;

  constructor(erro: ErroApi) {
    super(erro.mensagem);
    this.name = "ApiError";
    this.status = erro.status;
    this.campos = erro.campos ?? {};
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se o backend está em execução."
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const dados = await response.json().catch(() => null);

  if (!response.ok) {
    if (dados && typeof dados === "object" && "mensagem" in dados) {
      throw new ApiError(dados as ErroApi);
    }
    throw new Error(`Erro inesperado ao chamar ${path} (status ${response.status}).`);
  }

  if (dados === null) {
    throw new Error("O servidor devolveu uma resposta inválida.");
  }

  return dados as T;
}

// ---------------------------------------------------------------------------
// Chaves PIX
// ---------------------------------------------------------------------------

export type TipoChavePixManual = "CPF" | "CNPJ" | "EMAIL" | "TELEFONE";
export type TipoChavePix = TipoChavePixManual | "ALEATORIA";

export interface ChavePixResponse {
  id: string;
  contaId: string;
  tipo: TipoChavePix;
  valor: string;
  criadaEm: string;
}

interface ValidarChavePixRequest {
  tipo: TipoChavePixManual;
  valor: string;
}

interface ValidarChavePixResponse {
  tipo: TipoChavePixManual;
  valorNormalizado: string;
  valida: boolean;
  disponivelParaAssociacao: boolean;
}

export function validarChavePix(dados: ValidarChavePixRequest) {
  return request<ValidarChavePixResponse>("/api/chaves-pix/validar", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function associarChavePix(dados: ValidarChavePixRequest & { contaId: string }) {
  return request<ChavePixResponse>("/api/chaves-pix", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function gerarChavePixAleatoria(contaId: string) {
  return request<ChavePixResponse>("/api/chaves-pix/aleatoria", {
    method: "POST",
    body: JSON.stringify({ contaId }),
  });
}

// ---------------------------------------------------------------------------
// Usuário
// ---------------------------------------------------------------------------

export type TipoDocumento = "CPF" | "CNPJ";

export interface UsuarioResponse {
  id: string;
  nomeCompleto: string;
  tipoDocumento: TipoDocumento;
  documento: string;
  email: string;
  telefone: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CriarUsuarioRequest {
  nomeCompleto: string;
  tipoDocumento: TipoDocumento;
  documento: string;
  email: string;
  telefone: string;
}

export interface AtualizarUsuarioRequest {
  nomeCompleto: string;
  email: string;
  telefone: string;
}

export function criarUsuario(dados: CriarUsuarioRequest) {
  return request<UsuarioResponse>("/api/usuarios", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function buscarUsuario(id: string) {
  return request<UsuarioResponse>(`/api/usuarios/${id}`, { cache: "no-store" });
}

export function atualizarUsuario(id: string, dados: AtualizarUsuarioRequest) {
  return request<UsuarioResponse>(`/api/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function removerUsuario(id: string) {
  return request<void>(`/api/usuarios/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Conta bancária
// ---------------------------------------------------------------------------

export type Conta = {
  id: string;
  usuarioId: string;
  nomeTitular: string;
  agencia: string;
  numero: string;
  saldo: number;
  tipoConta: "CORRENTE" | "POUPANCA";
  limiteDiario: number;
  notificacao: "EMAIL" | "SMS" | null;
  status: "ATIVA" | "BLOQUEADA";
  criadaEm: string;
  atualizadaEm: string;
};

export type ContaBancariaResponse = Conta;

export interface CriarContaBancariaRequest {
  usuarioId: string;
  agencia: string;
  tipoConta: "CORRENTE" | "POUPANCA";
}

export interface AtualizarContaBancariaRequest {
  agencia: string;
  numero: string;
}

export function criarConta({ usuarioId, agencia, tipoConta }: CriarContaBancariaRequest): Promise<Conta> {
  return request<Conta>("/api/contas", {
    method: "POST",
    body: JSON.stringify({ usuarioId, agencia, tipoConta }),
  });
}

export function buscarConta(id: string): Promise<Conta> {
  return request<Conta>(`/api/contas/${id}`, { cache: "no-store" });
}

export function listarContasDoUsuario(usuarioId: string): Promise<Conta[]> {
  return request<Conta[]>(`/api/usuarios/${usuarioId}/contas`, { cache: "no-store" });
}

export function atualizarConta(id: string, dados: AtualizarContaBancariaRequest) {
  return request<ContaBancariaResponse>(`/api/contas/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function removerConta(id: string): Promise<void> {
  return request<void>(`/api/contas/${id}`, { method: "DELETE" });
}

export function definirLimiteDiario(id: string, limiteDiario: number): Promise<Conta> {
  return request<Conta>(`/api/contas/${id}/limite-diario`, {
    method: "PATCH",
    body: JSON.stringify({ limiteDiario }),
  });
}

export function definirNotificacao(id: string, canal: "EMAIL" | "SMS" | null): Promise<Conta> {
  return request<Conta>(`/api/contas/${id}/notificacao`, {
    method: "PATCH",
    body: JSON.stringify({ canal }),
  });
}

export interface ChavePixResolvida {
  chaveId: string;
  tipo: TipoChavePix;
  valor: string;
  contaId: string;
  nomeTitular: string;
}

export interface TransferirPixRequest {
  contaOrigemId: string;
  chaveDestino: string;
  valor: number;
}

export interface TransferenciaPix {
  id: string;
  contaOrigemId: string | null;
  contaDestinoId: string;
  chaveDestinoUtilizada: string;
  valor: number;
  recebimentoExterno: boolean;
  origemExterna: string | null;
  realizadaEm: string;
}

export function resolverChavePix(valor: string) {
  const consulta = new URLSearchParams({ valor });
  return request<ChavePixResolvida>(`/api/chaves-pix/resolver?${consulta}`, { cache: "no-store" });
}

export function transferirPix(dados: TransferirPixRequest) {
  return request<TransferenciaPix>("/api/pix/transferencias", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function buscarTransferenciaPix(id: string) {
  return request<TransferenciaPix>(`/api/pix/transferencias/${encodeURIComponent(id)}`, { cache: "no-store" });
}

export function listarExtratoPix(contaId: string) {
  return request<TransferenciaPix[]>(`/api/contas/${contaId}/extrato-pix`, { cache: "no-store" });
}
