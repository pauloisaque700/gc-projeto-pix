package com.byebank.pix.api.conta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record CriarContaBancariaRequest(
        @NotNull(message = "O identificador do usuário é obrigatório.")
        UUID usuarioId,

        @NotBlank(message = "A agência é obrigatória.")
        @Pattern(regexp = "\\d{1,10}", message = "A agência deve conter de 1 a 10 dígitos.")
        String agencia,

        @NotBlank(message = "O número da conta é obrigatório.")
        @Pattern(regexp = "\\d{1,20}", message = "O número da conta deve conter de 1 a 20 dígitos.")
        String numero
) {
}
