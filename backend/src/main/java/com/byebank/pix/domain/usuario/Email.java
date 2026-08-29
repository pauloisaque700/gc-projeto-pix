package com.byebank.pix.domain.usuario;

import java.util.Locale;
import java.util.regex.Pattern;

/** Endereço de e-mail normalizado para comparação e comunicação futura. */
public record Email(String valor) {
    private static final Pattern FORMATO_VALIDO = Pattern.compile(
            "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$",
            Pattern.CASE_INSENSITIVE
    );

    public Email {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException("O e-mail é obrigatório.");
        }

        valor = valor.trim().toLowerCase(Locale.ROOT);
        if (!FORMATO_VALIDO.matcher(valor).matches()) {
            throw new IllegalArgumentException("E-mail inválido.");
        }
    }

    public static Email criar(String valor) {
        return new Email(valor);
    }
}
