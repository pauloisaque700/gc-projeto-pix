package com.byebank.pix.infrastructure.pix;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.conta.Dinheiro;
import com.byebank.pix.domain.pix.RepositorioTransferenciaPix;
import com.byebank.pix.domain.pix.TransferenciaPix;
import com.byebank.pix.infrastructure.mysql.ErrosMysql;
import java.math.BigDecimal;
import java.sql.Types;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
@Profile("mysql")
public class RepositorioTransferenciaPixMysql implements RepositorioTransferenciaPix {
    private static final RowMapper<TransferenciaPix> TRANSFERENCIA = (linha, numero) -> {
        String origem = linha.getString("conta_origem_id");
        return TransferenciaPix.reconstituir(UUID.fromString(linha.getString("id")),
                origem == null ? null : UUID.fromString(origem), UUID.fromString(linha.getString("conta_destino_id")),
                linha.getString("chave_destino_utilizada"), Dinheiro.de(linha.getBigDecimal("valor")),
                linha.getString("origem_externa"), linha.getObject("realizada_em", LocalDateTime.class).toInstant(ZoneOffset.UTC));
    };

    private final JdbcClient jdbc;

    public RepositorioTransferenciaPixMysql(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public TransferenciaPix salvar(TransferenciaPix transferencia) {
        UUID origem = transferencia.getContaOrigemId();
        try {
            jdbc.sql("""
                    INSERT INTO transferencia_pix (id, conta_origem_id, conta_destino_id, chave_destino_utilizada,
                                                   valor, status, origem_externa, criada_em, realizada_em)
                    VALUES (:id, :origem, :destino, :chave, :valor, 'CONCLUIDA', :origemExterna, :instante, :instante)
                    """).param("id", transferencia.getId().toString())
                    .param("origem", origem == null ? null : origem.toString(), Types.CHAR)
                    .param("destino", transferencia.getContaDestinoId().toString())
                    .param("chave", transferencia.getChaveDestinoUtilizada()).param("valor", transferencia.getValor().valor())
                    .param("origemExterna", transferencia.getOrigemExterna(), Types.LONGVARCHAR)
                    .param("instante", LocalDateTime.ofInstant(transferencia.getRealizadaEm(), ZoneOffset.UTC)).update();
            return transferencia;
        } catch (DataAccessException erro) {
            if (ErrosMysql.referenciaInexistente(erro)) {
                throw new RecursoNaoEncontradoException("Conta bancária não encontrada.");
            }
            throw erro;
        }
    }

    @Override
    public Optional<TransferenciaPix> buscarPorId(UUID id) {
        return jdbc.sql("""
                SELECT id, conta_origem_id, conta_destino_id, chave_destino_utilizada, valor, origem_externa, realizada_em
                FROM transferencia_pix WHERE id = :id AND status = 'CONCLUIDA'
                """).param("id", id.toString()).query(TRANSFERENCIA).optional();
    }

    @Override
    public List<TransferenciaPix> listarPorConta(UUID contaId) {
        return jdbc.sql("""
                SELECT id, conta_origem_id, conta_destino_id, chave_destino_utilizada, valor, origem_externa, realizada_em
                FROM transferencia_pix WHERE (conta_origem_id = :id OR conta_destino_id = :id) AND status = 'CONCLUIDA'
                ORDER BY realizada_em DESC, id
                """).param("id", contaId.toString()).query(TRANSFERENCIA).list();
    }

    @Override
    public Dinheiro totalDebitado(UUID contaId, Instant inicio, Instant fim) {
        BigDecimal total = jdbc.sql("""
                SELECT COALESCE(SUM(valor), 0) FROM transferencia_pix
                WHERE conta_origem_id = :id AND status = 'CONCLUIDA' AND realizada_em >= :inicio AND realizada_em < :fim
                """).param("id", contaId.toString())
                .param("inicio", LocalDateTime.ofInstant(inicio, ZoneOffset.UTC))
                .param("fim", LocalDateTime.ofInstant(fim, ZoneOffset.UTC)).query(BigDecimal.class).single();
        return Dinheiro.de(total);
    }

    @Override
    public void remover(TransferenciaPix transferencia) {
        // O extrato preserva a movimentação e o total diário após uma tentativa de exclusão da conta.
        throw new RegraDeNegocioException("A conta possui registros vinculados e não pode ser removida.");
    }
}
