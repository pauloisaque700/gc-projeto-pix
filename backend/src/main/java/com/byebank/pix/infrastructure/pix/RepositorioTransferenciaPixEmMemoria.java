package com.byebank.pix.infrastructure.pix;

import com.byebank.pix.domain.pix.RepositorioTransferenciaPix;
import com.byebank.pix.domain.pix.TransferenciaPix;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository; 

@Repository
public class RepositorioTransferenciaPixEmMemoria implements RepositorioTransferenciaPix {
    private final Map<UUID, TransferenciaPix> transferenciasPorId = new ConcurrentHashMap<>();

    @Override
    public TransferenciaPix salvar(TransferenciaPix transferencia) {
        transferenciasPorId.put(transferencia.getId(), transferencia);
        return transferencia;
    }

    @Override
    public Optional<TransferenciaPix> buscarPorId(UUID id) {
        return Optional.ofNullable(transferenciasPorId.get(id));
    }

    @Override
    public List<TransferenciaPix> listarPorConta(UUID contaId) {
        return transferenciasPorId.values().stream()
                .filter(transferencia -> contaId.equals(transferencia.getContaOrigemId())
                        || contaId.equals(transferencia.getContaDestinoId()))
                .sorted(Comparator.comparing(TransferenciaPix::getRealizadaEm).reversed())
                .toList();
    }
}