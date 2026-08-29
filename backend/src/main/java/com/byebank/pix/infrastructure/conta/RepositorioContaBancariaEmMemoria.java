package com.byebank.pix.infrastructure.conta;

import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.RepositorioContaBancaria;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** Implementação temporária enquanto não há banco de dados. */
@Repository
public class RepositorioContaBancariaEmMemoria implements RepositorioContaBancaria {
    private final Map<UUID, ContaBancaria> contasPorId = new ConcurrentHashMap<>();
    private final Map<String, UUID> idsPorIdentificacao = new ConcurrentHashMap<>();

    @Override
    public ContaBancaria salvar(ContaBancaria conta) {
        contasPorId.put(conta.getId(), conta);
        idsPorIdentificacao.put(chaveIdentificacao(conta.getAgencia(), conta.getNumero()), conta.getId());
        return conta;
    }

    @Override
    public Optional<ContaBancaria> buscarPorId(UUID id) {
        return Optional.ofNullable(contasPorId.get(id));
    }

    @Override
    public boolean existePorAgenciaENumero(String agencia, String numero) {
        return idsPorIdentificacao.containsKey(chaveIdentificacao(agencia, numero));
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
        idsPorIdentificacao.remove(chaveIdentificacao(conta.getAgencia(), conta.getNumero()));
    }

    private String chaveIdentificacao(String agencia, String numero) {
        return agencia + ":" + numero;
    }
}
