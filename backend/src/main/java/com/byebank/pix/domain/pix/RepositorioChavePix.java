package com.byebank.pix.domain.pix;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioChavePix {
    ChavePix salvar(ChavePix chave);

    Optional<ChavePix> buscarPorId(UUID id);

    Optional<ChavePix> buscarPorValor(String valor);

    default Optional<ChavePix> buscarPorValorParaTransferencia(String valor) {
        return buscarPorValor(valor);
    }

    boolean existePorValor(String valor);

    List<ChavePix> listarPorContaId(UUID contaId);

    void remover(ChavePix chave);
}
