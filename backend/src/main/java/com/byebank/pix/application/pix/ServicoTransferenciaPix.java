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
import java.util.List;
import java.util.UUID;

@Service
public class ServicoTransferenciaPix {
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

        if (!contaOrigem.temSaldoSuficiente(valor)) {
            throw new RegraDeNegocioException("Saldo insuficiente para realizar a transferência.");
        }

        contaOrigem.debitar(valor);
        contaDestino.creditar(valor);

        repositorioConta.salvar(contaOrigem);
        repositorioConta.salvar(contaDestino);

        TransferenciaPix transferencia = TransferenciaPix.registrarEntreContas(
                contaOrigem.getId(), contaDestino.getId(), chaveDestino.getValor(), valor
        );
        return repositorioTransferencia.salvar(transferencia);
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

        contaDestino.creditar(valor);
        repositorioConta.salvar(contaDestino);

        TransferenciaPix transferencia = TransferenciaPix.registrarRecebimentoExterno(
                contaDestino.getId(), chaveDestino.getValor(), valor, comando.origemExterna()
        );
        return repositorioTransferencia.salvar(transferencia);
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