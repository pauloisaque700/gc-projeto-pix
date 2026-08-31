package com.byebank.pix.domain.pix;

import java.time.Instant;
import java.util.UUID;

public class ChavePixCnpj extends ChavePix{
    public ChavePixCnpj(UUID id, String valor, Instant criadaEm){
        super(id, valor, criadaEm);
    }

    @Override
    public boolean validar(){
        if(getValor() == null || getValor().isBlank()){
            return false;
        }

        String apenasNumero = getValor().replaceAll("\\D", "");
        return apenasNumero.length() == 14;
    }
}
