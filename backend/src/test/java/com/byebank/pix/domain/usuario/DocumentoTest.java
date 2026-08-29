package com.byebank.pix.domain.usuario;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DocumentoTest {

    @Test
    void deveAceitarCpfValidoMesmoComPontuacao() {
        Documento documento = Documento.criar(TipoDocumento.CPF, "529.982.247-25");

        assertEquals("52998224725", documento.valor());
    }

    @Test
    void deveAceitarCnpjValido() {
        assertDoesNotThrow(() -> Documento.criar(TipoDocumento.CNPJ, "11.222.333/0001-81"));
    }

    @Test
    void deveRejeitarCpfComDigitosVerificadoresInvalidos() {
        assertThrows(IllegalArgumentException.class,
                () -> Documento.criar(TipoDocumento.CPF, "529.982.247-24"));
    }
}
