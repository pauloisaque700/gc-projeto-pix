package com.byebank.pix.domain.pix;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.byebank.pix.domain.comum.EntidadeBase;

public abstract class ChavePix extends EntidadeBase{
    private final String valor;
    private final Instant criadaEm;
    private UUID contaId;

    protected ChavePix(UUID id, String valor, Instant criadaEm) {
        super(id);
        this.valor = Objects.requireNonNull(valor, "O valor da chave é obrigatório.");
        this.criadaEm = Objects.requireNonNull(criadaEm, "A data de criação é obrigatória.");
    }

    public abstract boolean validar();

    public abstract TipoChavePix getTipo();

    public void associar(){
        if (!validar()) {
            throw new IllegalStateException("Não é possível associar uma chave PIX com formato inválido.");
        }
        if (this.contaId != null) {
            throw new IllegalStateException("Esta chave PIX já está associada a uma conta.");
        }
        this.contaId = Objects.requireNonNull(contaId, "A conta para associação é obrigatória.");
    }

    public boolean estaAssociada() {
        return contaId != null;
    }
 
    public UUID getContaId() {
        return contaId;
    }

    public String getValor() {
        return this.valor;
    }

    public Instant getCriadaEm() {
        return this.criadaEm;
    }
}