// Sessão simplificada baseada em localStorage.
//
// O backend ainda não possui um módulo de autenticação/login — apenas
// cadastro e consulta de usuário. Enquanto isso não existir, guardamos o id
// do usuário cadastrado/"logado" no navegador para que as telas de perfil e
// contas bancárias saibam de quem buscar os dados.

const USUARIO_ID_KEY = "byebank:usuarioId";

export interface SessaoLocal {
  readonly usuarioId: string | null;
  readonly versao: number;
}

const sessaoInicial: SessaoLocal = { usuarioId: null, versao: 0 };
let sessaoAtual = sessaoInicial;
const observadores = new Set<() => void>();

function atualizarSessao(usuarioId: string | null) {
  sessaoAtual = { usuarioId, versao: sessaoAtual.versao + 1 };
}

function notificarSessao() {
  for (const notificar of observadores) notificar();
}

function aoAlterarStorage(evento: StorageEvent) {
  if (evento.storageArea !== window.localStorage || (evento.key !== USUARIO_ID_KEY && evento.key !== null)) return;

  // Invalida também consultas iniciadas antes de uma troca A → B → A.
  atualizarSessao(obterUsuarioLogado());
  notificarSessao();
}

export function observarSessaoLocal(notificar: () => void) {
  if (observadores.size === 0) window.addEventListener("storage", aoAlterarStorage);
  observadores.add(notificar);
  return () => {
    observadores.delete(notificar);
    if (observadores.size === 0) window.removeEventListener("storage", aoAlterarStorage);
  };
}

export function obterSessaoLocal(): SessaoLocal {
  const usuarioId = obterUsuarioLogado();
  if (usuarioId !== sessaoAtual.usuarioId) atualizarSessao(usuarioId);
  return sessaoAtual;
}

export function obterSessaoNoServidor(): SessaoLocal {
  return sessaoInicial;
}

export function salvarUsuarioLogado(usuarioId: string) {
  if (typeof window === "undefined" || obterUsuarioLogado() === usuarioId) return;
  window.localStorage.setItem(USUARIO_ID_KEY, usuarioId);
  atualizarSessao(usuarioId);
  notificarSessao();
}

export function obterUsuarioLogado(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USUARIO_ID_KEY);
}

export function limparUsuarioLogado(usuarioIdEsperado: string | null) {
  if (typeof window === "undefined" || obterUsuarioLogado() !== usuarioIdEsperado) return false;
  if (usuarioIdEsperado !== null) {
    window.localStorage.removeItem(USUARIO_ID_KEY);
    atualizarSessao(null);
    notificarSessao();
  }
  return true;
}
