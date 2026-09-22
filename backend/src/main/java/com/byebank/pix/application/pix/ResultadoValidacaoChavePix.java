package com.byebank.pix.application.pix;

import com.byebank.pix.domain.pix.TipoChavePix;

public record ResultadoValidacaoChavePix(TipoChavePix tipo, String valor, boolean valida, boolean disponivel) {
}