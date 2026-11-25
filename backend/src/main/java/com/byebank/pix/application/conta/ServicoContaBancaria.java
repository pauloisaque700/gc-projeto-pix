package com.byebank.pix.application.conta;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.CanalNotificacao;
import com.byebank.pix.domain.conta.Dinheiro;
import com.byebank.pix.domain.conta.TipoConta;
import com.byebank.pix.domain.conta.RepositorioContaBancaria;
import com.byebank.pix.domain.pix.ChavePix;
import com.byebank.pix.domain.pix.RepositorioChavePix;
import com.byebank.pix.domain.pix.RepositorioTransferenciaPix;
import com.byebank.pix.domain.pix.TransferenciaPix;
import com.byebank.pix.domain.usuario.RepositorioUsuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class ServicoContaBancaria {
    private final RepositorioContaBancaria repositorioConta;
    private final RepositorioUsuario repositorioUsuario;
    private final RepositorioChavePix repositorioChave;
    private final RepositorioTransferenciaPix repositorioTransferencia;

    public ServicoContaBancaria(RepositorioContaBancaria repositorioConta,
                                RepositorioUsuario repositorioUsuario,
                                RepositorioChavePix repositorioChave,
                                RepositorioTransferenciaPix repositorioTransferencia) {
        this.repositorioConta = repositorioConta;
        this.repositorioUsuario = repositorioUsuario;
        this.repositorioChave = repositorioChave;
        this.repositorioTransferencia = repositorioTransferencia;
    }

    public synchronized ContaBancaria cadastrar(CadastroContaBancariaCommand comando) {
        garantirUsuarioExiste(comando.usuarioId());
        String numero;
        do {
            numero = Integer.toString(ThreadLocalRandom.current().nextInt(100_000, 1_000_000));
        } while (repositorioConta.existePorAgenciaENumero(comando.agencia(), numero));

        return repositorioConta.inserir(ContaBancaria.criar(comando.usuarioId(), comando.agencia(), numero,
                comando.tipoConta() == null ? TipoConta.CORRENTE : comando.tipoConta()));
    }

    public ContaBancaria definirLimiteDiario(UUID id, BigDecimal limiteDiario) {
        ContaBancaria conta = buscarPorId(id);
        conta.definirLimiteDiario(Dinheiro.de(limiteDiario));
        return repositorioConta.salvar(conta);
    }

    public ContaBancaria definirNotificacao(UUID id, CanalNotificacao canal) {
        ContaBancaria conta = buscarPorId(id);
        conta.definirNotificacao(canal);
        return repositorioConta.salvar(conta);
    }

    public ContaBancaria bloquear(UUID id) {
        ContaBancaria conta = buscarPorId(id);
        try {
            conta.bloquear();
        } catch (IllegalStateException excecao) {
            throw new RegraDeNegocioException(excecao.getMessage());
        }
        return repositorioConta.salvar(conta);
    }

    public ContaBancaria desbloquear(UUID id) {
        ContaBancaria conta = buscarPorId(id);
        try {
            conta.desbloquear();
        } catch (IllegalStateException excecao) {
            throw new RegraDeNegocioException(excecao.getMessage());
        }
        return repositorioConta.salvar(conta);
    }

    public String obterNomeTitular(ContaBancaria conta) {
        return repositorioUsuario.buscarPorId(conta.getUsuarioId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."))
                .getNomeCompleto();
    }

    public ContaBancaria buscarPorId(UUID id) {
        return repositorioConta.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conta bancária não encontrada."));
    }

    public List<ContaBancaria> listarPorUsuario(UUID usuarioId) {
        garantirUsuarioExiste(usuarioId);
        return repositorioConta.listarPorUsuarioId(usuarioId);
    }

    public synchronized ContaBancaria atualizar(UUID id, AtualizacaoContaBancariaCommand comando) {
        ContaBancaria conta = buscarPorId(id);
        boolean alterouIdentificacao = !conta.getAgencia().equals(comando.agencia())
                || !conta.getNumero().equals(comando.numero());
        if (alterouIdentificacao && repositorioConta.existePorAgenciaENumero(comando.agencia(), comando.numero())) {
            throw new RegraDeNegocioException("Já existe uma conta cadastrada com esta agência e número.");
        }
        conta.atualizarDados(comando.agencia(), comando.numero());
        return repositorioConta.salvar(conta);
    }

    /**
     * Remove a conta em cascata, sem estorno de valores: primeiro as transferências PIX em que ela
     * aparece como origem ou destino, depois as chaves PIX associadas e, por último, a própria conta.
     */
    @Transactional
    public void remover(UUID id) {
        ContaBancaria conta = repositorioConta.buscarPorIdParaAtualizar(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conta bancária não encontrada."));
        for (TransferenciaPix transferencia : repositorioTransferencia.listarPorConta(conta.getId())) {
            repositorioTransferencia.remover(transferencia);
        }
        for (ChavePix chave : repositorioChave.listarPorContaId(conta.getId())) {
            repositorioChave.remover(chave);
        }
        repositorioConta.remover(conta);
    }

    private void garantirUsuarioExiste(UUID usuarioId) {
        if (usuarioId == null || repositorioUsuario.buscarPorId(usuarioId).isEmpty()) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado.");
        }
    }
}
