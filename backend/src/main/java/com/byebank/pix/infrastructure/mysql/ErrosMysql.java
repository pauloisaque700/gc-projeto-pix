package com.byebank.pix.infrastructure.mysql;

import java.sql.SQLException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;

public final class ErrosMysql {
    private ErrosMysql() {
    }

    public static boolean indiceDuplicado(DuplicateKeyException erro, String indice) {
        String mensagem = erro.getMostSpecificCause().getMessage();
        return mensagem != null && (mensagem.endsWith("'" + indice + "'")
                || mensagem.endsWith("." + indice + "'"));
    }

    public static boolean referenciaEmUso(DataAccessException erro) {
        return codigo(erro, 1451);
    }

    public static boolean referenciaInexistente(DataAccessException erro) {
        return codigo(erro, 1452);
    }

    public static boolean regraDoEsquema(DataAccessException erro) {
        return codigo(erro, 1644);
    }

    private static boolean codigo(DataAccessException erro, int codigo) {
        return erro.getMostSpecificCause() instanceof SQLException sql && sql.getErrorCode() == codigo;
    }
}
