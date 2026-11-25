package com.byebank.pix.infrastructure.conta;

import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.RepositorioContaBancaria;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** Implementação temporária enquanto não há banco de dados. */
@Repository
@Profile("!mysql")
public class RepositorioContaBancariaEmMemoria implements RepositorioContaBancaria {
    private final Map<UUID, ContaBancaria> contasPorId = new ConcurrentHashMap<>();

    @Override
    public ContaBancaria salvar(ContaBancaria conta) {
        contasPorId.put(conta.getId(), conta);
        return conta;
    }

    @Override
    public Optional<ContaBancaria> buscarPorId(UUID id) {
        return Optional.ofNullable(contasPorId.get(id));
    }

    @Override
    public boolean existePorAgenciaENumero(String agencia, String numero) {
        return contasPorId.values().stream()
                .anyMatch(conta -> conta.getAgencia().equals(agencia) && conta.getNumero().equals(numero));
    }

    @Override
    public boolean existePorUsuarioId(UUID usuarioId) {
        return contasPorId.values().stream().anyMatch(conta -> conta.getUsuarioId().equals(usuarioId));
    }

    @Override
    public List<ContaBancaria> listarPorUsuarioId(UUID usuarioId) {
        return contasPorId.values().stream()
                .filter(conta -> conta.getUsuarioId().equals(usuarioId))
                .toList();
    }

    @Override
    public void remover(ContaBancaria conta) {
        contasPorId.remove(conta.getId());
    }
}
