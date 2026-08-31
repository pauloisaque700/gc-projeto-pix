// Sessão simplificada baseada em localStorage.
//
// O backend ainda não possui um módulo de autenticação/login — apenas
// cadastro e consulta de usuário. Enquanto isso não existir, guardamos o id
// do usuário cadastrado/"logado" no navegador para que as telas de perfil e
// contas bancárias saibam de quem buscar os dados.

const USUARIO_ID_KEY = "byebank:usuarioId";

export function salvarUsuarioLogado(usuarioId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USUARIO_ID_KEY, usuarioId);
}

export function obterUsuarioLogado(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USUARIO_ID_KEY);
}

export function limparUsuarioLogado() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USUARIO_ID_KEY);
}
