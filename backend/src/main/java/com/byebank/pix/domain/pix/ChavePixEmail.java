package com.byebank.pix.domain.pix;

import java.time.Instant;
import java.util.UUID;

public class ChavePixEmail extends ChavePix{
    public ChavePixEmail(UUID id, String valor, Instant criadaEm){
        super(id, valor, criadaEm);
    }

    @Override
    public boolean validar(){
        if(getValor() == null || getValor().isBlank()){
            return false;
        }

        return getValor().matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
}
