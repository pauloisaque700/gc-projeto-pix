package com.byebank.pix.domain.pix;

import com.byebank.pix.domain.usuario.Documento;
import com.byebank.pix.domain.usuario.TipoDocumento;

import java.time.Instant;
import java.util.UUID;

public final class ChavePixCpf extends ChavePix{
    public ChavePixCpf(UUID id, String valor, Instant criadaEm){
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
            Documento.criar(TipoDocumento.CPF, getValor());
            return true;
        } catch (IllegalArgumentException excecaoDeFormatoInvalido) {
            return false;
        }
    }
    @Override
        public TipoChavePix getTipo() {
            return TipoChavePix.CPF;
        }
}


