package com.byebank.pix.api.pix;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record GerarChaveAleatoriaRequest(
        @NotNull(message = "O identificador da conta é obrigatório.")
        UUID contaId
) {
}