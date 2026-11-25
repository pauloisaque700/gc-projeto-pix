package com.byebank.pix.infrastructure.pix;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.pix.ChavePix;
import com.byebank.pix.domain.pix.FabricaChavePix;
import com.byebank.pix.domain.pix.RepositorioChavePix;
import com.byebank.pix.domain.pix.TipoChavePix;
import com.byebank.pix.infrastructure.mysql.ErrosMysql;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
@Profile("mysql")
public class RepositorioChavePixMysql implements RepositorioChavePix {
    private static final RowMapper<ChavePix> CHAVE = (linha, numero) -> FabricaChavePix.reconstituir(
            UUID.fromString(linha.getString("id")), TipoChavePix.valueOf(linha.getString("tipo")),
            linha.getString("valor"), linha.getObject("criada_em", LocalDateTime.class).toInstant(ZoneOffset.UTC),
            UUID.fromString(linha.getString("conta_id")));

    private final JdbcClient jdbc;

    public RepositorioChavePixMysql(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public ChavePix salvar(ChavePix chave) {
        try {
            jdbc.sql("""
                    INSERT INTO chave_pix (id, conta_id, tipo, valor, criada_em)
                    VALUES (:id, :contaId, :tipo, :valor, :criadaEm)
                    """).param("id", chave.getId().toString()).param("contaId", chave.getContaId().toString())
                    .param("tipo", chave.getTipo().name()).param("valor", chave.getValor())
                    .param("criadaEm", LocalDateTime.ofInstant(chave.getCriadaEm(), ZoneOffset.UTC)).update();
            return chave;
        } catch (DuplicateKeyException erro) {
            if (ErrosMysql.indiceDuplicado(erro, "uk_chave_valor")) {
                throw new RegraDeNegocioException("Esta chave PIX já está associada a outra conta.");
            }
            throw erro;
        } catch (DataAccessException erro) {
            if (ErrosMysql.referenciaInexistente(erro) || ErrosMysql.regraDoEsquema(erro)) {
                throw new RecursoNaoEncontradoException("Conta bancária não encontrada.");
            }
            throw erro;
        }
    }

    @Override
    public Optional<ChavePix> buscarPorId(UUID id) {
        return jdbc.sql("SELECT id, conta_id, tipo, valor, criada_em FROM chave_pix WHERE id = :id")
                .param("id", id.toString()).query(CHAVE).optional();
    }

    @Override
    public Optional<ChavePix> buscarPorValor(String valor) {
        return jdbc.sql("""
                SELECT id, conta_id, tipo, valor, criada_em FROM chave_pix WHERE valor = :valor AND status = 'ATIVA'
                """).param("valor", valor).query(CHAVE).optional();
    }

    @Override
    public Optional<ChavePix> buscarPorValorParaTransferencia(String valor) {
        return jdbc.sql("""
                SELECT id, conta_id, tipo, valor, criada_em FROM chave_pix
                WHERE valor = :valor AND status = 'ATIVA' FOR SHARE
                """).param("valor", valor).query(CHAVE).optional();
    }

    @Override
    public boolean existePorValor(String valor) {
        return jdbc.sql("SELECT EXISTS (SELECT 1 FROM chave_pix WHERE valor = :valor)")
                .param("valor", valor).query(Boolean.class).single();
    }

    @Override
    public List<ChavePix> listarPorContaId(UUID contaId) {
        return jdbc.sql("""
                SELECT id, conta_id, tipo, valor, criada_em FROM chave_pix WHERE conta_id = :contaId
                ORDER BY criada_em, id
                """).param("contaId", contaId.toString()).query(CHAVE).list();
    }

    @Override
    public void remover(ChavePix chave) {
        jdbc.sql("DELETE FROM chave_pix WHERE id = :id").param("id", chave.getId().toString()).update();
    }
}
