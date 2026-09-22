package com.byebank.pix.api.pix;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record AssociarChavePixRequest(
        @NotNull(message = "O identificador da conta é obrigatório.")
        UUID contaId,

        @NotBlank(message = "O tipo da chave é obrigatório.")
        @Pattern(regexp = "CPF|CNPJ|EMAIL|TELEFONE", message = "O tipo da chave deve ser CPF, CNPJ, EMAIL ou TELEFONE.")
        String tipo,

        @NotBlank(message = "O valor da chave é obrigatório.")
        String valor
) {
}