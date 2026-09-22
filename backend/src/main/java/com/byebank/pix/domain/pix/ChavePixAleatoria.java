package com.byebank.pix.domain.pix;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

public final class ChavePixAleatoria extends ChavePix{
    public ChavePixAleatoria(UUID id, String valor, Instant criadaEm){
        super(id, normalizar(valor), criadaEm);
    }

    private static String normalizar(String valor) {
        return valor == null ? null : valor.trim().toLowerCase(Locale.ROOT);
    }

    @Override
    public boolean validar(){
        if(getValor() == null || getValor().isBlank()){
            return false;
        }
        return getValor().matches("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");  
    }

    @Override
    public TipoChavePix getTipo() {
        return TipoChavePix.ALEATORIA;
    }
}