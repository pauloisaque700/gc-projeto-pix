package com.byebank.pix.application.pix;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.Dinheiro;
import com.byebank.pix.domain.conta.RepositorioContaBancaria;
import com.byebank.pix.domain.pix.ChavePix;
import com.byebank.pix.domain.pix.FabricaChavePix;
import com.byebank.pix.domain.pix.RepositorioChavePix;
import com.byebank.pix.domain.pix.RepositorioTransferenciaPix;
import com.byebank.pix.domain.pix.TransferenciaPix;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
public class ServicoTransferenciaPix {
    private static final ZoneId FUSO_OPERACIONAL = ZoneId.of("America/Sao_Paulo");

    private final RepositorioContaBancaria repositorioConta;
    private final RepositorioChavePix repositorioChave;
    private final RepositorioTransferenciaPix repositorioTransferencia;

    public ServicoTransferenciaPix(RepositorioContaBancaria repositorioConta,
                                    RepositorioChavePix repositorioChave,
                                    RepositorioTransferenciaPix repositorioTransferencia) {
        this.repositorioConta = repositorioConta;
        this.repositorioChave = repositorioChave;
        this.repositorioTransferencia = repositorioTransferencia;
    }

    /** Transfere um valor entre duas contas do próprio banco, localizando o destino pela chave PIX informada. */
    public TransferenciaPix transferir(TransferirPixCommand comando) {
        ContaBancaria contaOrigem = buscarContaOuFalhar(comando.contaOrigemId());
        ChavePix chaveDestino = buscarChaveOuFalhar(comando.chaveDestino());
        ContaBancaria contaDestino = buscarContaOuFalhar(chaveDestino.getContaId());

        if (contaOrigem.getId().equals(contaDestino.getId())) {
            throw new RegraDeNegocioException("Não é possível transferir para a própria conta.");
        }

        Dinheiro valor = converterValor(comando.valor());

        // Usa a mesma ordem de bloqueio mesmo quando origem e destino se invertem.
        boolean origemPrimeiro = contaOrigem.getId().compareTo(contaDestino.getId()) < 0;
        ContaBancaria primeira = origemPrimeiro ? contaOrigem : contaDestino;
        ContaBancaria segunda = origemPrimeiro ? contaDestino : contaOrigem;
        return primeira.executarComRollbackFinanceiro(() -> segunda.executarComRollbackFinanceiro(
                () -> efetivarTransferencia(contaOrigem, contaDestino, chaveDestino, valor)));
    }

    private TransferenciaPix efetivarTransferencia(ContaBancaria origem, ContaBancaria destino,
                                                   ChavePix chaveDestino, Dinheiro valor) {
        buscarContaOuFalhar(origem.getId());
        buscarContaOuFalhar(destino.getId());

        TransferenciaPix transferencia = TransferenciaPix.registrarEntreContas(
                origem.getId(), destino.getId(), chaveDestino.getValor(), valor);
        LocalDate diaOperacional = transferencia.getRealizadaEm().atZone(FUSO_OPERACIONAL).toLocalDate();
        Dinheiro totalAposTransferencia = totalDebitadoNoDia(origem.getId(), diaOperacional).somar(valor);
        if (!origem.getLimiteDiario().ehMaiorOuIgualA(totalAposTransferencia)) {
            throw new RegraDeNegocioException("Limite diário de transferência excedido.");
        }
        if (!origem.temSaldoSuficiente(valor)) {
            throw new RegraDeNegocioException("Saldo insuficiente para realizar a transferência.");
        }
        origem.garantirContaAtiva();
        destino.garantirContaAtiva();

        origem.debitar(valor);
        destino.creditar(valor);
        repositorioConta.salvar(origem);
        repositorioConta.salvar(destino);
        return salvarTransferencia(transferencia);
    }

    /**
     * Simula o recebimento de um PIX vindo de fora do banco (já que este projeto
     * ainda não integra com outras instituições), creditando diretamente a conta
     * de destino localizada pela chave PIX informada.
     */
    public TransferenciaPix receberExterno(ReceberPixExternoCommand comando) {
        ChavePix chaveDestino = buscarChaveOuFalhar(comando.chaveDestino());
        ContaBancaria contaDestino = buscarContaOuFalhar(chaveDestino.getContaId());

        Dinheiro valor = converterValor(comando.valor());

        return contaDestino.executarComRollbackFinanceiro(() -> {
            buscarContaOuFalhar(contaDestino.getId());
            contaDestino.garantirContaAtiva();
            TransferenciaPix transferencia = TransferenciaPix.registrarRecebimentoExterno(
                    contaDestino.getId(), chaveDestino.getValor(), valor, comando.origemExterna());
            contaDestino.creditar(valor);
            repositorioConta.salvar(contaDestino);
            return salvarTransferencia(transferencia);
        });
    }

    private TransferenciaPix salvarTransferencia(TransferenciaPix transferencia) {
        try {
            return repositorioTransferencia.salvar(transferencia);
        } catch (RuntimeException | Error falha) {
            // O repositório em memória remove pelo UUID mesmo se o registro não chegou a ser inserido.
            repositorioTransferencia.remover(transferencia);
            throw falha;
        }
    }

    public TransferenciaPix buscarPorId(UUID id) {
        return repositorioTransferencia.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Transferência PIX não encontrada."));
    }

    /** Extrato de PIX de uma conta (transferências em que ela aparece como origem ou destino). */
    public List<TransferenciaPix> listarExtrato(UUID contaId) {
        ContaBancaria conta = buscarContaOuFalhar(contaId);
        synchronized (conta) {
            buscarContaOuFalhar(contaId);
            return repositorioTransferencia.listarPorConta(contaId);
        }
    }

    private ChavePix buscarChaveOuFalhar(String chaveDigitada) {
        if (chaveDigitada == null || chaveDigitada.isBlank()) {
            throw new RegraDeNegocioException("Informe a chave PIX de destino.");
        }
        String valorNormalizado = FabricaChavePix.normalizarParaBusca(chaveDigitada);
        return repositorioChave.buscarPorValor(valorNormalizado)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Chave PIX de destino não encontrada."));
    }

    private ContaBancaria buscarContaOuFalhar(UUID contaId) {
        return repositorioConta.buscarPorId(contaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conta bancária não encontrada."));
    }

    private Dinheiro converterValor(BigDecimal valor) {
        Dinheiro dinheiro = Dinheiro.de(valor);
        if (!dinheiro.ehPositivo()) {
            throw new RegraDeNegocioException("O valor da transação PIX deve ser positivo.");
        }
        return dinheiro;
    }

    private Dinheiro totalDebitadoNoDia(UUID contaId, LocalDate dia) {
        return repositorioTransferencia.listarPorConta(contaId).stream()
                .filter(transferencia -> contaId.equals(transferencia.getContaOrigemId()))
                .filter(transferencia -> transferencia.getRealizadaEm()
                        .atZone(FUSO_OPERACIONAL)
                        .toLocalDate()
                        .equals(dia))
                .map(TransferenciaPix::getValor)
                .reduce(Dinheiro.zero(), Dinheiro::somar);
    }
}
