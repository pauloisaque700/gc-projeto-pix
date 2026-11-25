package com.byebank.pix.infrastructure.usuario;

import com.byebank.pix.domain.usuario.Documento;
import com.byebank.pix.domain.usuario.RepositorioUsuario;
import com.byebank.pix.domain.usuario.Usuario;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** Implementação temporária enquanto o projeto ainda não usa banco de dados. */
@Repository
@Profile("!mysql")
public class RepositorioUsuarioEmMemoria implements RepositorioUsuario {
    private final Map<UUID, Usuario> usuariosPorId = new ConcurrentHashMap<>();
    private final Map<Documento, UUID> idsPorDocumento = new ConcurrentHashMap<>();

    @Override
    public Usuario salvar(Usuario usuario) {
        usuariosPorId.put(usuario.getId(), usuario);
        idsPorDocumento.put(usuario.getDocumento(), usuario.getId());
        return usuario;
    }

    @Override
    public Optional<Usuario> buscarPorId(UUID id) {
        return Optional.ofNullable(usuariosPorId.get(id));
    }

    @Override
    public boolean existePorDocumento(Documento documento) {
        return idsPorDocumento.containsKey(documento);
    }

    @Override
    public void remover(Usuario usuario) {
        usuariosPorId.remove(usuario.getId());
        idsPorDocumento.remove(usuario.getDocumento());
    }
}
