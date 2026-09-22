package com.byebank.pix.domain.pix;

import com.byebank.pix.domain.usuario.Email;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

public final class ChavePixEmail extends ChavePix{
    public ChavePixEmail(UUID id, String valor, Instant criadaEm){
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
        try {
            Email.criar(getValor());
            return true;
        } catch (IllegalArgumentException excecaoDeFormatoInvalido) {
            return false;
        }
    }
    @Override
    public TipoChavePix getTipo() {
        return TipoChavePix.EMAIL;
    }
}
