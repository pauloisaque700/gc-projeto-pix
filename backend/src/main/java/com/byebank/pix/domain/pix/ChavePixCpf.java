package com.byebank.pix.domain.pix;

import java.time.Instant;
import java.util.UUID;

public final class ChavePixCpf extends ChavePix{
    public ChavePixCpf(UUID id, String valor, Instant criadaEm){
        super(id, valor, criadaEm);
    }

    @Override
    public boolean validar(){
        if(getValor() == null || getValor().isBlank()){
            return false;
        }
        String apenasNumeros = getValor().replaceAll("\\D", "");
        return apenasNumeros.length() == 11;
    }
}


