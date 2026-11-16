package com.byebank.pix.domain.usuario;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TelefoneTest {

    @Test
    void deveAceitarTelefoneDeDezDigitosComEMascarado() {
        assertEquals("8899990000", Telefone.criar("8899990000").valor());
        assertEquals("8899990000", Telefone.criar("(88) 9999-0000").valor());
    }

    @Test
    void deveAceitarTelefoneDeOnzeDigitosComESemMascara() {
        assertEquals("88999990000", Telefone.criar("88999990000").valor());
        assertEquals("88999990000", Telefone.criar("(88) 99999-0000").valor());
    }

    @Test
    void deveRejeitarTelefoneComQuantidadeDeDigitosInvalida() {
        assertThrows(IllegalArgumentException.class, () -> Telefone.criar("889999000"));
        assertThrows(IllegalArgumentException.class, () -> Telefone.criar("889999900000"));
    }
}
