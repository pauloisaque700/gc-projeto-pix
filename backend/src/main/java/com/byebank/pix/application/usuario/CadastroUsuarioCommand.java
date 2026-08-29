package com.byebank.pix.application.usuario;

import com.byebank.pix.domain.usuario.TipoDocumento;

public record CadastroUsuarioCommand(
        String nomeCompleto,
        TipoDocumento tipoDocumento,
        String documento,
        String email,
        String telefone
) {
}
