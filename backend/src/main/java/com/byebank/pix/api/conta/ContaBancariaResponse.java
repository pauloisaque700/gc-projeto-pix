package com.byebank.pix.api.conta;

import com.byebank.pix.domain.conta.ContaBancaria;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ContaBancariaResponse(
        UUID id,
        UUID usuarioId,
        String nomeTitular,
        String agencia,
        String numero,
        BigDecimal saldo,
        String tipoConta,
        BigDecimal limiteDiario,
        String notificacao,
        String status,
        Instant criadaEm,
        Instant atualizadaEm
) {
    public static ContaBancariaResponse de(ContaBancaria conta, String nomeTitular) {
        return new ContaBancariaResponse(
                conta.getId(),
                conta.getUsuarioId(),
                nomeTitular,
                conta.getAgencia(),
                conta.getNumero(),
                conta.getSaldo().valor(),
                conta.getTipoConta().name(),
                conta.getLimiteDiario().valor(),
                conta.getNotificacao() == null ? null : conta.getNotificacao().name(),
                conta.getStatus().name(),
                conta.getCriadaEm(),
                conta.getAtualizadaEm()
        );
    }
}
