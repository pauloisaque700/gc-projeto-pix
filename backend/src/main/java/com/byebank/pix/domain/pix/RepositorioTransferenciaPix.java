package com.byebank.pix.domain.pix;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioTransferenciaPix {
    TransferenciaPix salvar(TransferenciaPix transferencia);

    Optional<TransferenciaPix> buscarPorId(UUID id);

    List<TransferenciaPix> listarPorConta(UUID contaId);

    void remover(TransferenciaPix transferencia);
}
