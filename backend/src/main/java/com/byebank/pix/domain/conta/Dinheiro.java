package com.byebank.pix.domain.conta;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/** Valor monetário em reais, sempre com duas casas decimais. */
public record Dinheiro(BigDecimal valor) {

    public Dinheiro {
        Objects.requireNonNull(valor, "O valor monetário é obrigatório.");
        try {
            valor = valor.setScale(2, RoundingMode.UNNECESSARY);
        } catch (ArithmeticException excecao) {
            throw new IllegalArgumentException("Valores monetários devem ter no máximo duas casas decimais.", excecao);
        }
    }

    public static Dinheiro zero() {
        return new Dinheiro(BigDecimal.ZERO);
    }

    public static Dinheiro de(BigDecimal valor) {
        return new Dinheiro(valor);
    }

    public boolean ehNegativo() {
        return valor.signum() < 0;
    }

    public boolean ehPositivo() {
        return valor.signum() > 0;
    }

    public boolean ehMaiorOuIgualA(Dinheiro outro) {
        return valor.compareTo(outro.valor) >= 0;
    }

    public Dinheiro somar(Dinheiro outro) {
        return new Dinheiro(valor.add(outro.valor));
    }

    public Dinheiro subtrair(Dinheiro outro) {
        return new Dinheiro(valor.subtract(outro.valor));
    }
}
