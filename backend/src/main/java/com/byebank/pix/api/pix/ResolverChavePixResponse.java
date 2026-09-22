package com.byebank.pix.api.pix;

import com.byebank.pix.application.pix.ResolucaoChavePix;

import java.util.UUID;

public record ResolverChavePixResponse(
        UUID chaveId,
        String tipo,
        String valor,
        UUID contaId,
        String nomeTitular
) {
    public static ResolverChavePixResponse de(ResolucaoChavePix resolucao) {
        return new ResolverChavePixResponse(
                resolucao.chave().getId(),
                resolucao.chave().getTipo().name(),
                resolucao.chave().getValor(),
                resolucao.contaId(),
                resolucao.nomeTitular()
        );
    }
}