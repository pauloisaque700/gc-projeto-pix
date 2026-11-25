package com.byebank.pix.domain.conta;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioContaBancaria {
    default ContaBancaria inserir(ContaBancaria conta) {
        return salvar(conta);
    }

    ContaBancaria salvar(ContaBancaria conta);

    Optional<ContaBancaria> buscarPorId(UUID id);

    boolean existePorAgenciaENumero(String agencia, String numero);

    boolean existePorUsuarioId(UUID usuarioId);

    List<ContaBancaria> listarPorUsuarioId(UUID usuarioId);

    void remover(ContaBancaria conta);
}
