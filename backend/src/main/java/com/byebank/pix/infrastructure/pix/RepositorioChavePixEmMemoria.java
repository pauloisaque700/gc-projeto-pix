package com.byebank.pix.infrastructure.pix;

import com.byebank.pix.domain.pix.ChavePix;
import com.byebank.pix.domain.pix.RepositorioChavePix;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class RepositorioChavePixEmMemoria implements RepositorioChavePix {
    private final Map<UUID, ChavePix> chavesPorId = new ConcurrentHashMap<>();
    private final Map<String, UUID> idsPorValor = new ConcurrentHashMap<>();

    @Override
    public ChavePix salvar(ChavePix chave) {
        chavesPorId.put(chave.getId(), chave);
        idsPorValor.put(chave.getValor(), chave.getId());
        return chave;
    }

    @Override
    public Optional<ChavePix> buscarPorId(UUID id) {
        return Optional.ofNullable(chavesPorId.get(id));
    }

    @Override
    public Optional<ChavePix> buscarPorValor(String valor) {
        UUID id = idsPorValor.get(valor);
        return id == null ? Optional.empty() : Optional.ofNullable(chavesPorId.get(id));
    }

    @Override
    public boolean existePorValor(String valor) {
        return idsPorValor.containsKey(valor);
    }

    @Override
    public List<ChavePix> listarPorContaId(UUID contaId) {
        return chavesPorId.values().stream()
                .filter(chave -> chave.estaAssociada() && chave.getContaId().equals(contaId))
                .toList();
    }

    @Override
    public void remover(ChavePix chave) {
        chavesPorId.remove(chave.getId());
        idsPorValor.remove(chave.getValor());
    }
}
