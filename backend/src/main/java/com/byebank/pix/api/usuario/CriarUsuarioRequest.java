package com.byebank.pix.api.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CriarUsuarioRequest(
        @NotBlank(message = "O nome completo é obrigatório.")
        @Size(max = 150, message = "O nome completo deve ter no máximo 150 caracteres.")
        String nomeCompleto,

        @NotBlank(message = "O tipo do documento é obrigatório.")
        @Pattern(regexp = "CPF|CNPJ", message = "O tipo do documento deve ser CPF ou CNPJ.")
        String tipoDocumento,

        @NotBlank(message = "O documento é obrigatório.")
        String documento,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "E-mail inválido.")
        String email,

        @NotBlank(message = "O telefone é obrigatório.")
        String telefone
) {
}
