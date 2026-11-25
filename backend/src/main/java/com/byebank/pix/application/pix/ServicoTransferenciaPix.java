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
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.function.BiFunction;

@Service
@Profile("!mysql")
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
        ChavePix chaveDestino = buscarChaveOuFalhar(comando.chaveDestino());
        if (comando.contaOrigemId().equals(chaveDestino.getContaId())) {
            throw new RegraDeNegocioException("Não é possível transferir para a própria conta.");
        }
        Dinheiro valor = converterValor(comando.valor());
        return movimentar(comando.contaOrigemId(), chaveDestino.getContaId(), (origem, destino) -> {
            confirmarChaveDestino(chaveDestino);
            TransferenciaPix transferencia = TransferenciaPix.registrarEntreContas(
                    origem.getId(), destino.getId(), chaveDestino.getValor(), valor);
            var dia = transferencia.getRealizadaEm().atZone(FUSO_OPERACIONAL).toLocalDate();
            Dinheiro totalDebitado = repositorioTransferencia.totalDebitado(origem.getId(),
                    dia.atStartOfDay(FUSO_OPERACIONAL).toInstant(), dia.plusDays(1).atStartOfDay(FUSO_OPERACIONAL).toInstant());

            if (!origem.getLimiteDiario().ehMaiorOuIgualA(totalDebitado.somar(valor))) {
                throw new RegraDeNegocioException("Limite diário de transferência excedido.");
            }
            if (!origem.temSaldoSuficiente(valor)) {
                throw new RegraDeNegocioException("Saldo insuficiente para realizar a transferência.");
            }
            origem.garantirContaAtiva();
            destino.garantirContaAtiva();
            origem.debitar(valor);
            repositorioConta.salvarSaldo(origem);
            destino.creditar(valor);
            repositorioConta.salvarSaldo(destino);
            return registrar(transferencia);
        });
    }

    /**
     * Simula o recebimento de um PIX vindo de fora do banco (já que este projeto
     * ainda não integra com outras instituições), creditando diretamente a conta
     * de destino localizada pela chave PIX informada.
     */
    public TransferenciaPix receberExterno(ReceberPixExternoCommand comando) {
        ChavePix chaveDestino = buscarChaveOuFalhar(comando.chaveDestino());
        Dinheiro valor = converterValor(comando.valor());
        return movimentar(null, chaveDestino.getContaId(), (origem, destino) -> {
            confirmarChaveDestino(chaveDestino);
            destino.creditar(valor);
            repositorioConta.salvarSaldo(destino);
            return registrar(TransferenciaPix.registrarRecebimentoExterno(
                    destino.getId(), chaveDestino.getValor(), valor, comando.origemExterna()));
        });
    }

    protected TransferenciaPix movimentar(UUID origemId, UUID destinoId,
                                          BiFunction<ContaBancaria, ContaBancaria, TransferenciaPix> operacao) {
        ContaBancaria destino = buscarContaOuFalhar(destinoId);
        if (origemId == null) {
            return destino.executarComRollbackFinanceiro(() -> operacao.apply(null, destino));
        }
        ContaBancaria origem = buscarContaOuFalhar(origemId);
        boolean origemPrimeiro = origemId.compareTo(destinoId) < 0;
        ContaBancaria primeira = origemPrimeiro ? origem : destino;
        ContaBancaria segunda = origemPrimeiro ? destino : origem;
        return primeira.executarComRollbackFinanceiro(() -> segunda.executarComRollbackFinanceiro(
                () -> operacao.apply(origem, destino)));
    }

    protected TransferenciaPix registrar(TransferenciaPix transferencia) {
        try {
            return repositorioTransferencia.salvar(transferencia);
        } catch (RuntimeException | Error falha) {
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
        buscarContaOuFalhar(contaId);
        return repositorioTransferencia.listarPorConta(contaId);
    }

    private ChavePix buscarChaveOuFalhar(String chaveDigitada) {
        if (chaveDigitada == null || chaveDigitada.isBlank()) {
            throw new RegraDeNegocioException("Informe a chave PIX de destino.");
        }
        String valorNormalizado = FabricaChavePix.normalizarParaBusca(chaveDigitada);
        return repositorioChave.buscarPorValor(valorNormalizado)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Chave PIX de destino não encontrada."));
    }

    private void confirmarChaveDestino(ChavePix chave) {
        repositorioChave.buscarPorValorParaTransferencia(chave.getValor())
                .filter(atual -> atual.getId().equals(chave.getId()) && atual.getContaId().equals(chave.getContaId()))
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

}
