package com.byebank.pix.api.pix;

import com.byebank.pix.domain.pix.TransferenciaPix;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransferenciaPixResponse(
        UUID id,
        UUID contaOrigemId,
        UUID contaDestinoId,
        String chaveDestinoUtilizada,
        BigDecimal valor,
        boolean recebimentoExterno,
        String origemExterna,
        Instant realizadaEm
) {
    public static TransferenciaPixResponse de(TransferenciaPix transferencia) {
        return new TransferenciaPixResponse(
                transferencia.getId(),
                transferencia.getContaOrigemId(),
                transferencia.getContaDestinoId(),
                transferencia.getChaveDestinoUtilizada(),
                transferencia.getValor().valor(),
                transferencia.ehRecebimentoExterno(),
                transferencia.getOrigemExterna(),
                transferencia.getRealizadaEm()
        );
    }
}