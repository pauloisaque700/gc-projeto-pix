package com.byebank.pix.api.conta;

import com.byebank.pix.domain.conta.ContaBancaria;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ContaBancariaResponse(
        UUID id,
        UUID usuarioId,
        String agencia,
        String numero,
        BigDecimal saldo,
        Instant criadaEm,
        Instant atualizadaEm
) {
    public static ContaBancariaResponse de(ContaBancaria conta) {
        return new ContaBancariaResponse(
                conta.getId(),
                conta.getUsuarioId(),
                conta.getAgencia(),
                conta.getNumero(),
                conta.getSaldo().valor(),
                conta.getCriadaEm(),
                conta.getAtualizadaEm()
        );
    }
}
