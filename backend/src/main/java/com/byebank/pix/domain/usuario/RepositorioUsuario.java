package com.byebank.pix.domain.usuario;

import java.util.Optional;
import java.util.UUID;

public interface RepositorioUsuario {
    default Usuario inserir(Usuario usuario) {
        return salvar(usuario);
    }

    Usuario salvar(Usuario usuario);

    Optional<Usuario> buscarPorId(UUID id);

    boolean existePorDocumento(Documento documento);

    void remover(Usuario usuario);
}
