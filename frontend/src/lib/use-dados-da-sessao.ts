"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ApiError, buscarUsuario, listarContasDoUsuario, type Conta, type UsuarioResponse } from "./api";
import { limparUsuarioLogado, observarSessaoLocal, obterSessaoLocal, obterSessaoNoServidor, type SessaoLocal } from "./session";

export interface DadosDaSessao {
  usuario: UsuarioResponse;
  contas: Conta[];
}

interface ResultadoDaSessao {
  sessao: SessaoLocal;
  tentativa: number;
  dados: DadosDaSessao | null;
  erro: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useDadosDaSessao() {
  const router = useRouter();
  const sessao = useSyncExternalStore(observarSessaoLocal, obterSessaoLocal, obterSessaoNoServidor);
  const [resultado, setResultado] = useState<ResultadoDaSessao | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    const sessaoValida = () => ativo && obterSessaoLocal() === sessao;

    function voltarAoLogin() {
      if (sessaoValida() && limparUsuarioLogado(sessao.usuarioId)) router.replace("/login/tela-login");
    }

    async function carregar() {
      try {
        if (!sessaoValida()) return;
        const id = sessao.usuarioId;
        if (!id || !UUID.test(id)) {
          voltarAoLogin();
          return;
        }

        const [usuario, contas] = await Promise.all([buscarUsuario(id), listarContasDoUsuario(id)]);
        if (sessaoValida()) setResultado({ sessao, tentativa, dados: { usuario, contas }, erro: null });
      } catch (error) {
        if (!sessaoValida()) return;
        if (error instanceof ApiError && error.status === 404) {
          voltarAoLogin();
          return;
        }
        const erro = error instanceof Error ? error.message : "Não foi possível carregar os dados da sessão.";
        setResultado({ sessao, tentativa, dados: null, erro });
      }
    }

    void carregar();
    return () => { ativo = false; };
  }, [router, sessao, tentativa]);

  function recarregar() {
    setTentativa((atual) => atual + 1);
  }

  const atual = resultado?.sessao === sessao && resultado.tentativa === tentativa ? resultado : null;
  return { sessao, dados: atual?.dados ?? null, erro: atual?.erro ?? null, recarregar };
}
