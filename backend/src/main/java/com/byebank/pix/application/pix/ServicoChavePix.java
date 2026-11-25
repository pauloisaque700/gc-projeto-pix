package com.byebank.pix.application.pix;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.RepositorioContaBancaria;
import com.byebank.pix.domain.pix.ChavePix;
import com.byebank.pix.domain.pix.FabricaChavePix;
import com.byebank.pix.domain.pix.RepositorioChavePix;
import com.byebank.pix.domain.pix.TipoChavePix;
import com.byebank.pix.domain.usuario.RepositorioUsuario;
import com.byebank.pix.domain.usuario.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ServicoChavePix {

    /** Mesmo limite praticado pelo PIX real para contas de pessoa física. */
    private static final int MAXIMO_CHAVES_POR_CONTA = 5;

    private final RepositorioChavePix repositorioChave;
    private final RepositorioContaBancaria repositorioConta;
    private final RepositorioUsuario repositorioUsuario;

    public ServicoChavePix(RepositorioChavePix repositorioChave,
                            RepositorioContaBancaria repositorioConta,
                            RepositorioUsuario repositorioUsuario) {
        this.repositorioChave = repositorioChave;
        this.repositorioConta = repositorioConta;
        this.repositorioUsuario = repositorioUsuario;
    }

    /** Valida apenas o formato da chave, sem persistir nada. */
    public ResultadoValidacaoChavePix validar(TipoChavePix tipo, String valor) {
        if (tipo == TipoChavePix.ALEATORIA) {
            throw new RegraDeNegocioException(
                    "Chaves aleatórias são geradas automaticamente pelo sistema e não precisam de validação de formato.");
        }
        ChavePix chave = FabricaChavePix.criar(tipo, valor);
        boolean valida = chave.validar();
        boolean disponivel = valida && !repositorioChave.existePorValor(chave.getValor());
        return new ResultadoValidacaoChavePix(tipo, chave.getValor(), valida, disponivel);
    }

    @Transactional
    public ChavePix associar(AssociarChavePixCommand comando) {
        ContaBancaria conta = bloquearContaOuFalhar(comando.contaId());
        garantirLimiteDeChaves(conta.getId());

        ChavePix chave = FabricaChavePix.criar(comando.tipo(), comando.valor());
        if (!chave.validar()) {
            throw new RegraDeNegocioException(
                    "A chave PIX informada é inválida para o tipo " + comando.tipo() + ".");
        }

        if (comando.tipo() == TipoChavePix.CPF || comando.tipo() == TipoChavePix.CNPJ) {
            garantirChavePertenceAoTitular(conta, chave);
        }

        if (repositorioChave.existePorValor(chave.getValor())) {
            throw new RegraDeNegocioException("Esta chave PIX já está associada a outra conta.");
        }

        chave.associar(conta.getId());
        return repositorioChave.salvar(chave);
    }

    @Transactional
    public ChavePix gerarAleatoria(UUID contaId) {
        ContaBancaria conta = bloquearContaOuFalhar(contaId);
        garantirLimiteDeChaves(conta.getId());

        ChavePix chave;
        do {
            chave = FabricaChavePix.criar(TipoChavePix.ALEATORIA, null);
        } while (repositorioChave.existePorValor(chave.getValor()));

        chave.associar(conta.getId());
        return repositorioChave.salvar(chave);
    }

    public ChavePix buscarPorId(UUID id) {
        return repositorioChave.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Chave PIX não encontrada."));
    }

    public ChavePix buscarPorValor(String valorDigitado) {
        if (valorDigitado == null || valorDigitado.isBlank()) {
            throw new RegraDeNegocioException("Informe a chave PIX de destino.");
        }
        return repositorioChave.buscarPorValor(FabricaChavePix.normalizarParaBusca(valorDigitado))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Chave PIX não encontrada."));
    }

    /** Resolve uma chave PIX digitada em uma transferência, incluindo o nome do titular da conta de destino. */
    public ResolucaoChavePix resolver(String valorDigitado) {
        ChavePix chave = buscarPorValor(valorDigitado);
        ContaBancaria conta = buscarContaOuFalhar(chave.getContaId());
        Usuario titular = repositorioUsuario.buscarPorId(conta.getUsuarioId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário titular da conta não encontrado."));
        return new ResolucaoChavePix(chave, conta.getId(), titular.getNomeCompleto());
    }

    public List<ChavePix> listarPorConta(UUID contaId) {
        buscarContaOuFalhar(contaId);
        return repositorioChave.listarPorContaId(contaId);
    }

    @Transactional
    public void remover(UUID chaveId) {
        ChavePix chave = buscarPorId(chaveId);
        bloquearContaOuFalhar(chave.getContaId());
        repositorioChave.remover(chave);
    }

    private ContaBancaria bloquearContaOuFalhar(UUID contaId) {
        return repositorioConta.buscarPorIdParaAtualizar(contaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conta bancária não encontrada."));
    }

    private void garantirChavePertenceAoTitular(ContaBancaria conta, ChavePix chave) {
        Usuario titular = repositorioUsuario.buscarPorId(conta.getUsuarioId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário titular da conta não encontrado."));
        if (!titular.getDocumento().valor().equals(chave.getValor())) {
            throw new RegraDeNegocioException(
                    "A chave PIX do tipo " + chave.getTipo() + " deve corresponder ao documento do titular da conta.");
        }
    }

    private void garantirLimiteDeChaves(UUID contaId) {
        if (repositorioChave.listarPorContaId(contaId).size() >= MAXIMO_CHAVES_POR_CONTA) {
            throw new RegraDeNegocioException(
                    "Limite de " + MAXIMO_CHAVES_POR_CONTA + " chaves PIX por conta atingido.");
        }
    }

    private ContaBancaria buscarContaOuFalhar(UUID contaId) {
        return repositorioConta.buscarPorId(contaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conta bancária não encontrada."));
    }
}
