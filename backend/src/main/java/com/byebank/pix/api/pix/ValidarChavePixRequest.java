package com.byebank.pix.api.pix;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ValidarChavePixRequest(
        @NotBlank(message = "O tipo da chave é obrigatório.")
        @Pattern(regexp = "CPF|CNPJ|EMAIL|TELEFONE", message = "O tipo da chave deve ser CPF, CNPJ, EMAIL ou TELEFONE.")
        String tipo,

        @NotBlank(message = "O valor da chave é obrigatório.")
        String valor
) {
}