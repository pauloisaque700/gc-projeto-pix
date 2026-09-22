package com.byebank.pix.api.pix;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ReceberPixExternoRequest(
        @NotBlank(message = "A chave PIX de destino é obrigatória.")
        String chaveDestino,

        @NotNull(message = "O valor recebido é obrigatório.")
        @DecimalMin(value = "0.01", message = "O valor recebido deve ser maior que zero.")
        BigDecimal valor,

        String origemExterna
) {
}