package com.byebank.pix.domain.pix;

import com.byebank.pix.domain.conta.Dinheiro;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioTransferenciaPix {
    TransferenciaPix salvar(TransferenciaPix transferencia);

    Optional<TransferenciaPix> buscarPorId(UUID id);

    List<TransferenciaPix> listarPorConta(UUID contaId);

    default Dinheiro totalDebitado(UUID contaId, Instant inicio, Instant fim) {
        return listarPorConta(contaId).stream()
                .filter(transferencia -> contaId.equals(transferencia.getContaOrigemId()))
                .filter(transferencia -> !transferencia.getRealizadaEm().isBefore(inicio)
                        && transferencia.getRealizadaEm().isBefore(fim))
                .map(TransferenciaPix::getValor)
                .reduce(Dinheiro.zero(), Dinheiro::somar);
    }

    void remover(TransferenciaPix transferencia);
}
