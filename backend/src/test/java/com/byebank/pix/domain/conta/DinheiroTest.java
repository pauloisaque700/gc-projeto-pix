package com.byebank.pix.domain.conta;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DinheiroTest {

    @Test
    void deveManterDuasCasasDecimais() {
        Dinheiro dinheiro = Dinheiro.de(new BigDecimal("10"));

        assertEquals(new BigDecimal("10.00"), dinheiro.valor());
    }

    @Test
    void deveRejeitarMaisDeDuasCasasDecimais() {
        assertThrows(IllegalArgumentException.class, () -> Dinheiro.de(new BigDecimal("10.001")));
    }
}
