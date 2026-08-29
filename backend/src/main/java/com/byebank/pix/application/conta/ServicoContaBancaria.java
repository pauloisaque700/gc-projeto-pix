package com.byebank.pix.application.conta;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.RepositorioContaBancaria;
import com.byebank.pix.domain.usuario.RepositorioUsuario;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ServicoContaBancaria {
    private final RepositorioContaBancaria repositorioConta;
    private final RepositorioUsuario repositorioUsuario;

    public ServicoContaBancaria(RepositorioContaBancaria repositorioConta, RepositorioUsuario repositorioUsuario) {
        this.repositorioConta = repositorioConta;
        this.repositorioUsuario = repositorioUsuario;
    }

    public ContaBancaria cadastrar(CadastroContaBancariaCommand comando) {
        garantirUsuarioExiste(comando.usuarioId());
        if (repositorioConta.existePorAgenciaENumero(comando.agencia(), comando.numero())) {
            throw new RegraDeNegocioException("Já existe uma conta cadastrada com esta agência e número.");
        }
        return repositorioConta.salvar(ContaBancaria.criar(comando.usuarioId(), comando.agencia(), comando.numero()));
    }

    public ContaBancaria buscarPorId(UUID id) {
        return repositorioConta.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conta bancária não encontrada."));
    }

    public List<ContaBancaria> listarPorUsuario(UUID usuarioId) {
        garantirUsuarioExiste(usuarioId);
        return repositorioConta.listarPorUsuarioId(usuarioId);
    }

    public ContaBancaria atualizar(UUID id, AtualizacaoContaBancariaCommand comando) {
        ContaBancaria conta = buscarPorId(id);
        boolean alterouIdentificacao = !conta.getAgencia().equals(comando.agencia())
                || !conta.getNumero().equals(comando.numero());
        if (alterouIdentificacao && repositorioConta.existePorAgenciaENumero(comando.agencia(), comando.numero())) {
            throw new RegraDeNegocioException("Já existe uma conta cadastrada com esta agência e número.");
        }
        conta.atualizarDados(comando.agencia(), comando.numero());
        return repositorioConta.salvar(conta);
    }

    public void remover(UUID id) {
        repositorioConta.remover(buscarPorId(id));
    }

    private void garantirUsuarioExiste(UUID usuarioId) {
        if (usuarioId == null || repositorioUsuario.buscarPorId(usuarioId).isEmpty()) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado.");
        }
    }
}
