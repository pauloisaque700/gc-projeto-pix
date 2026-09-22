package com.byebank.pix.api.pix;

import com.byebank.pix.domain.pix.ChavePix;

import java.time.Instant;
import java.util.UUID;

public record ChavePixResponse(
        UUID id,
        String tipo,
        String valor,
        UUID contaId,
        Instant criadaEm
) {
    public static ChavePixResponse de(ChavePix chave) {
        return new ChavePixResponse(
                chave.getId(),
                chave.getTipo().name(),
                chave.getValor(),
                chave.getContaId(),
                chave.getCriadaEm()
        );
    }
}