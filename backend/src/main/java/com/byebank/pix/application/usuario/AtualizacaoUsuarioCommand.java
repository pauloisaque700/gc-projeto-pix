package com.byebank.pix.application.usuario;

public record AtualizacaoUsuarioCommand(String nomeCompleto, String email, String telefone) {
}
