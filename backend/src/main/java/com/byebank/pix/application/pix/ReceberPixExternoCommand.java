package com.byebank.pix.application.pix;

import java.math.BigDecimal;

public record ReceberPixExternoCommand(String chaveDestino, BigDecimal valor, String origemExterna) {
}