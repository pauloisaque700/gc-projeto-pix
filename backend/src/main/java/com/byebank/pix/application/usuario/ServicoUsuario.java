package com.byebank.pix.application.usuario;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.application.conta.ServicoContaBancaria;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.usuario.Documento;
import com.byebank.pix.domain.usuario.Email;
import com.byebank.pix.domain.usuario.RepositorioUsuario;
import com.byebank.pix.domain.usuario.Telefone;
import com.byebank.pix.domain.usuario.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.UUID;

@Service
public class ServicoUsuario {
    private final RepositorioUsuario repositorioUsuario;
    private final ServicoContaBancaria servicoConta;

    public ServicoUsuario(RepositorioUsuario repositorioUsuario, ServicoContaBancaria servicoConta) {
        this.repositorioUsuario = repositorioUsuario;
        this.servicoConta = servicoConta;
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
        return repositorioUsuario.inserir(usuario);
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

    /** Remove o usuário em cascata: cada conta (com seu próprio cascade) e só depois o usuário. */
    @Transactional
    public void remover(UUID id) {
        Usuario usuario = buscarPorId(id);
        var contas = servicoConta.listarPorUsuario(usuario.getId()).stream()
                .sorted(Comparator.comparing(ContaBancaria::getId)).toList();
        for (ContaBancaria conta : contas) {
            servicoConta.remover(conta.getId());
        }
        repositorioUsuario.remover(usuario);
    }
}
