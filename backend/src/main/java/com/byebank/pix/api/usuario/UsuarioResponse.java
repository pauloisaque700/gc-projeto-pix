package com.byebank.pix.api.usuario;

import com.byebank.pix.domain.usuario.Usuario;

import java.time.Instant;
import java.util.UUID;

public record UsuarioResponse(
        UUID id,
        String nomeCompleto,
        String tipoDocumento,
        String documento,
        String email,
        String telefone,
        Instant criadoEm,
        Instant atualizadoEm
) {
    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNomeCompleto(),
                usuario.getDocumento().tipo().name(),
                usuario.getDocumento().valor(),
                usuario.getEmail().valor(),
                usuario.getTelefone().valor(),
                usuario.getCriadoEm(),
                usuario.getAtualizadoEm()
        );
    }
}
