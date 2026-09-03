package com.byebank.pix.domain.pix;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.byebank.pix.domain.comum.EntidadeBase;

public abstract class ChavePix extends EntidadeBase{
    private final String valor;
    private final Instant criadaEm;

    protected ChavePix(UUID id, String valor, Instant criadaEm) {
        super(id);
        this.valor = Objects.requireNonNull(valor, "O valor da chave é obrigatório.");
        this.criadaEm = Objects.requireNonNull(criadaEm, "A data de criação é obrigatória.");
    }

    public abstract boolean validar();

    public void associar(){
    //falta implemetar    
    }

    public String getValor() {
        return this.valor;
    }

    public Instant getCriadaEm() {
        return this.criadaEm;
    }
}