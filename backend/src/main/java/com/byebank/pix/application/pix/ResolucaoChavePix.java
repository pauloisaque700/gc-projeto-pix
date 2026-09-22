package com.byebank.pix.application.pix;

import com.byebank.pix.domain.pix.ChavePix;

import java.util.UUID;

public record ResolucaoChavePix(ChavePix chave, UUID contaId, String nomeTitular) {
}