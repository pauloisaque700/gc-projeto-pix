package com.byebank.pix.application.pix;

import java.math.BigDecimal;
import java.util.UUID;

public record TransferirPixCommand(UUID contaOrigemId, String chaveDestino, BigDecimal valor) {
}