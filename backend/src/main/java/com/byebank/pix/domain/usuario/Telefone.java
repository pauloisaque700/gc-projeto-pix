package com.byebank.pix.domain.usuario;

/** Número brasileiro com DDD, mantido somente com dígitos. */
public record Telefone(String valor) {
    public Telefone {
        if (valor == null) {
            throw new IllegalArgumentException("O telefone é obrigatório.");
        }

        valor = valor.replaceAll("\\D", "");
        if (valor.length() != 10 && valor.length() != 11) {
            throw new IllegalArgumentException("Telefone inválido. Informe DDD e número.");
        }
    }

    public static Telefone criar(String valor) {
        return new Telefone(valor);
    }
}
