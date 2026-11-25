package com.byebank.pix.infrastructure.conta;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.conta.CanalNotificacao;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.Dinheiro;
import com.byebank.pix.domain.conta.RepositorioContaBancaria;
import com.byebank.pix.domain.conta.StatusConta;
import com.byebank.pix.domain.conta.TipoConta;
import com.byebank.pix.infrastructure.mysql.ErrosMysql;
import java.sql.Types;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
@Profile("mysql")
public class RepositorioContaBancariaMysql implements RepositorioContaBancaria {
    private static final RowMapper<ContaBancaria> CONTA = (linha, numero) -> {
        String canal = linha.getString("notificacao");
        return ContaBancaria.reconstituir(
                UUID.fromString(linha.getString("id")), UUID.fromString(linha.getString("usuario_id")),
                linha.getString("agencia"), linha.getString("numero"), Dinheiro.de(linha.getBigDecimal("saldo")),
                TipoConta.valueOf(linha.getString("tipo_conta")), Dinheiro.de(linha.getBigDecimal("limite_diario")),
                canal == null ? null : CanalNotificacao.valueOf(canal), StatusConta.valueOf(linha.getString("status")),
                linha.getObject("criada_em", LocalDateTime.class).toInstant(ZoneOffset.UTC),
                linha.getObject("atualizada_em", LocalDateTime.class).toInstant(ZoneOffset.UTC));
    };

    private final JdbcClient jdbc;

    public RepositorioContaBancariaMysql(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public ContaBancaria inserir(ContaBancaria conta) {
        try {
            dadosEditaveis(jdbc.sql("""
                    INSERT INTO conta_bancaria (id, usuario_id, agencia, numero, saldo, tipo_conta, limite_diario,
                                                notificacao, status, criada_em, atualizada_em)
                    VALUES (:id, :usuarioId, :agencia, :numero, :saldo, :tipo, :limite,
                            :notificacao, :status, :criadaEm, :atualizadaEm)
                    """), conta)
                    .param("usuarioId", conta.getUsuarioId().toString())
                    .param("saldo", conta.getSaldo().valor())
                    .param("tipo", conta.getTipoConta().name())
                    .param("criadaEm", LocalDateTime.ofInstant(conta.getCriadaEm(), ZoneOffset.UTC))
                    .update();
            return conta;
        } catch (DuplicateKeyException erro) {
            throw traduzirDuplicidade(erro);
        } catch (DataAccessException erro) {
            // O titular pode ter sido removido ou encerrado depois da consulta feita pelo serviço.
            if (ErrosMysql.referenciaInexistente(erro) || ErrosMysql.regraDoEsquema(erro)) {
                throw new RecursoNaoEncontradoException("Usuário não encontrado.");
            }
            throw erro;
        }
    }

    @Override
    public ContaBancaria salvar(ContaBancaria conta) {
        try {
            int alteradas = dadosEditaveis(jdbc.sql("""
                    UPDATE conta_bancaria SET agencia = :agencia, numero = :numero, limite_diario = :limite,
                                             notificacao = :notificacao, status = :status, atualizada_em = :atualizadaEm
                    WHERE id = :id AND status <> 'ENCERRADA'
                    """), conta).update();
            if (alteradas == 0 && buscarPorId(conta.getId()).isEmpty()) {
                throw new RecursoNaoEncontradoException("Conta bancária não encontrada.");
            }
            return conta;
        } catch (DuplicateKeyException erro) {
            throw traduzirDuplicidade(erro);
        }
    }

    @Override
    public Optional<ContaBancaria> buscarPorId(UUID id) {
        return jdbc.sql("""
                SELECT id, usuario_id, agencia, numero, saldo, tipo_conta, limite_diario, notificacao,
                       status, criada_em, atualizada_em
                FROM conta_bancaria WHERE id = :id AND status <> 'ENCERRADA'
                """).param("id", id.toString()).query(CONTA).optional();
    }

    @Override
    public boolean existePorAgenciaENumero(String agencia, String numero) {
        return jdbc.sql("""
                SELECT EXISTS (SELECT 1 FROM conta_bancaria WHERE agencia = :agencia AND numero = :numero)
                """).param("agencia", agencia).param("numero", numero).query(Boolean.class).single();
    }

    @Override
    public boolean existePorUsuarioId(UUID usuarioId) {
        return jdbc.sql("""
                SELECT EXISTS (SELECT 1 FROM conta_bancaria WHERE usuario_id = :usuarioId AND status <> 'ENCERRADA')
                """).param("usuarioId", usuarioId.toString()).query(Boolean.class).single();
    }

    @Override
    public List<ContaBancaria> listarPorUsuarioId(UUID usuarioId) {
        return jdbc.sql("""
                SELECT id, usuario_id, agencia, numero, saldo, tipo_conta, limite_diario, notificacao,
                       status, criada_em, atualizada_em
                FROM conta_bancaria WHERE usuario_id = :usuarioId AND status <> 'ENCERRADA'
                ORDER BY criada_em, id
                """).param("usuarioId", usuarioId.toString()).query(CONTA).list();
    }

    @Override
    public void remover(ContaBancaria conta) {
        try {
            jdbc.sql("DELETE FROM conta_bancaria WHERE id = :id AND status <> 'ENCERRADA'")
                    .param("id", conta.getId().toString()).update();
        } catch (DataIntegrityViolationException erro) {
            if (ErrosMysql.referenciaEmUso(erro)) {
                throw new RegraDeNegocioException("A conta possui registros vinculados e não pode ser removida.");
            }
            throw erro;
        }
    }

    private JdbcClient.StatementSpec dadosEditaveis(JdbcClient.StatementSpec consulta, ContaBancaria conta) {
        CanalNotificacao canal = conta.getNotificacao();
        return consulta.param("id", conta.getId().toString())
                .param("agencia", conta.getAgencia()).param("numero", conta.getNumero())
                .param("limite", conta.getLimiteDiario().valor())
                .param("notificacao", canal == null ? null : canal.name(), Types.VARCHAR)
                .param("status", conta.getStatus().name())
                .param("atualizadaEm", LocalDateTime.ofInstant(conta.getAtualizadaEm(), ZoneOffset.UTC));
    }

    private RuntimeException traduzirDuplicidade(DuplicateKeyException erro) {
        if (ErrosMysql.indiceDuplicado(erro, "uk_conta_agencia_numero")) {
            return new RegraDeNegocioException("Já existe uma conta cadastrada com esta agência e número.");
        }
        return erro;
    }
}
