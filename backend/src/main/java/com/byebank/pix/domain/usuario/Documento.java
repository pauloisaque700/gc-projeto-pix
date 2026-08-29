package com.byebank.pix.domain.usuario;

import java.util.Objects;

/** Identificador fiscal normalizado e validado de um usuário. */
public record Documento(TipoDocumento tipo, String valor) {

    public Documento {
        Objects.requireNonNull(tipo, "O tipo do documento é obrigatório.");
        valor = somenteDigitos(valor);

        if (!ehValido(tipo, valor)) {
            throw new IllegalArgumentException("Documento inválido para o tipo informado.");
        }
    }

    public static Documento criar(TipoDocumento tipo, String valor) {
        return new Documento(tipo, valor);
    }

    private static String somenteDigitos(String valor) {
        if (valor == null) {
            throw new IllegalArgumentException("O documento é obrigatório.");
        }
        return valor.replaceAll("\\D", "");
    }

    private static boolean ehValido(TipoDocumento tipo, String valor) {
        return switch (tipo) {
            case CPF -> cpfValido(valor);
            case CNPJ -> cnpjValido(valor);
        };
    }

    private static boolean cpfValido(String cpf) {
        if (cpf.length() != 11 || todosOsDigitosIguais(cpf)) {
            return false;
        }

        int primeiroDigito = calcularDigito(cpf.substring(0, 9), 10);
        int segundoDigito = calcularDigito(cpf.substring(0, 9) + primeiroDigito, 11);
        return cpf.charAt(9) == Character.forDigit(primeiroDigito, 10)
                && cpf.charAt(10) == Character.forDigit(segundoDigito, 10);
    }

    private static boolean cnpjValido(String cnpj) {
        if (cnpj.length() != 14 || todosOsDigitosIguais(cnpj)) {
            return false;
        }

        int primeiroDigito = calcularDigitoCnpj(cnpj.substring(0, 12));
        int segundoDigito = calcularDigitoCnpj(cnpj.substring(0, 12) + primeiroDigito);
        return cnpj.charAt(12) == Character.forDigit(primeiroDigito, 10)
                && cnpj.charAt(13) == Character.forDigit(segundoDigito, 10);
    }

    private static int calcularDigito(String base, int pesoInicial) {
        int soma = 0;
        for (int indice = 0, peso = pesoInicial; indice < base.length(); indice++, peso--) {
            soma += Character.digit(base.charAt(indice), 10) * peso;
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private static int calcularDigitoCnpj(String base) {
        int soma = 0;
        int peso = base.length() == 12 ? 5 : 6;

        for (int indice = 0; indice < base.length(); indice++) {
            soma += Character.digit(base.charAt(indice), 10) * peso;
            peso = peso == 2 ? 9 : peso - 1;
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private static boolean todosOsDigitosIguais(String valor) {
        return valor.chars().distinct().count() == 1;
    }
}
