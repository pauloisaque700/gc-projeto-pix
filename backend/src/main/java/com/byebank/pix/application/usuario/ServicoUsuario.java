package com.byebank.pix.application.usuario;

import com.byebank.pix.domain.usuario.Documento;
import com.byebank.pix.domain.usuario.Email;
import com.byebank.pix.domain.usuario.RepositorioUsuario;
import com.byebank.pix.domain.usuario.Telefone;
import com.byebank.pix.domain.usuario.Usuario;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ServicoUsuario {
    private final RepositorioUsuario repositorioUsuario;

    public ServicoUsuario(RepositorioUsuario repositorioUsuario) {
        this.repositorioUsuario = repositorioUsuario;
    }

    public Usuario cadastrar(CadastroUsuarioCommand comando) {
        Documento documento = Documento.criar(comando.tipoDocumento(), comando.documento());
        if (repositorioUsuario.existePorDocumento(documento)) {
            throw new RegraDeNegocioException("Já existe um usuário cadastrado com este documento.");
        }

        Usuario usuario = Usuario.cadastrar(
                comando.nomeCompleto(),
                documento,
                Email.criar(comando.email()),
                Telefone.criar(comando.telefone())
        );
        return repositorioUsuario.salvar(usuario);
    }

    public Usuario buscarPorId(UUID id) {
        return repositorioUsuario.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
    }

    public Usuario atualizar(UUID id, AtualizacaoUsuarioCommand comando) {
        Usuario usuario = buscarPorId(id);
        usuario.atualizarDados(
                comando.nomeCompleto(),
                Email.criar(comando.email()),
                Telefone.criar(comando.telefone())
        );
        return repositorioUsuario.salvar(usuario);
    }

    public void remover(UUID id) {
        repositorioUsuario.remover(buscarPorId(id));
    }
}
