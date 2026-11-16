package com.byebank.pix.application.conta;

import java.util.UUID;
import com.byebank.pix.domain.conta.TipoConta;

public record CadastroContaBancariaCommand(UUID usuarioId, String agencia, String numero, TipoConta tipoConta) {
}
