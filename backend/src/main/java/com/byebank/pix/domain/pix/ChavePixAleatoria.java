package com.byebank.pix.domain.pix;

import java.time.Instant;
import java.util.UUID;

public class ChavePixAleatoria extends ChavePix{
    public ChavePixAleatoria(UUID id, String valor, Instant criadaEm){
        super(id, valor, criadaEm);
    }

    @Override
    public boolean validar(){
        if(getValor() == null || getValor().isBlank()){
            return false;
        }

        return getValor().matches("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");  
    }
}
