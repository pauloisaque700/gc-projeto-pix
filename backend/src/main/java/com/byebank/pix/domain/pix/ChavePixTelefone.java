package com.byebank.pix.domain.pix;

import java.time.Instant;
// import java.util.Locale;
import java.util.UUID;

import com.byebank.pix.domain.usuario.Telefone;

public final class ChavePixTelefone extends ChavePix{
    public ChavePixTelefone(UUID id, String valor, Instant criadaEm){
        super(id, normalizar(valor), criadaEm);
    }

    private static String normalizar(String valor) {
        return valor == null ? null : valor.replaceAll("\\D", "");
    }

    @Override
    public boolean validar(){
        if(getValor() == null || getValor().isBlank()){
            return false;
        }
        try {
            Telefone.criar(getValor());
            return true;
        } catch (IllegalArgumentException excecaoDeFormatoInvalido) {
            return false;
        }
    }

    @Override
    public TipoChavePix getTipo() {
        return TipoChavePix.TELEFONE;
    }
}
