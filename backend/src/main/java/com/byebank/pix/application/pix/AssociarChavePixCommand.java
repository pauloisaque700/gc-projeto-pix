package com.byebank.pix.application.pix;

import com.byebank.pix.domain.pix.TipoChavePix;

import java.util.UUID;

public record AssociarChavePixCommand(UUID contaId, TipoChavePix tipo, String valor) {
}