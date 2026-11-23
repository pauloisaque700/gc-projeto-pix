"use client";

import { useEffect, useState } from "react";
import { listarExtratoPix, type TransferenciaPix } from "./api";
import { pixMaisRecentes } from "./pix";

interface Extrato {
  contaId: string;
  itens: TransferenciaPix[];
  erro: string | null;
}

export function useExtratoPix(contaId: string | undefined) {
  const [extrato, setExtrato] = useState<Extrato | null>(null);

  useEffect(() => {
    if (!contaId) return;
    let ativo = true;
    listarExtratoPix(contaId)
      .then((itens) => {
        if (ativo) setExtrato({ contaId, itens: pixMaisRecentes(itens), erro: null });
      })
      .catch((error: unknown) => {
        if (ativo) setExtrato({
          contaId,
          itens: [],
          erro: error instanceof Error ? error.message : "Não foi possível carregar o extrato PIX.",
        });
      });
    return () => { ativo = false; };
  }, [contaId]);

  return extrato?.contaId === contaId ? extrato : null;
}
