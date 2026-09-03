package com.byebank.pix.domain.pix;

import java.time.Instant;
import java.util.UUID;

public class ChavePixTelefone extends ChavePix{
    public ChavePixTelefone(UUID id, String valor, Instant criadaEm){
        super(id, valor, criadaEm);
    }

    @Override
    public boolean validar(){
        if(getValor() == null || getValor().isBlank()){
            return false;
        }
        String apenasNumero = getValor().replaceAll("\\D", "");
        return apenasNumero.length() >= 10 && apenasNumero.length() <= 11;
    }
}
