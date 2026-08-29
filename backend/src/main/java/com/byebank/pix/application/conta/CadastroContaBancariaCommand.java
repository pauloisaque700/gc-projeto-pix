package com.byebank.pix.application.conta;

import java.util.UUID;

public record CadastroContaBancariaCommand(UUID usuarioId, String agencia, String numero) {
}
