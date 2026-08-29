package com.byebank.pix.domain.usuario;

import java.util.Optional;
import java.util.UUID;

public interface RepositorioUsuario {
    Usuario salvar(Usuario usuario);

    Optional<Usuario> buscarPorId(UUID id);

    boolean existePorDocumento(Documento documento);

    void remover(Usuario usuario);
}
