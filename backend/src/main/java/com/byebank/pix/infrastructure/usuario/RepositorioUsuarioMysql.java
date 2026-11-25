package com.byebank.pix.infrastructure.usuario;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.usuario.Documento;
import com.byebank.pix.domain.usuario.Email;
import com.byebank.pix.domain.usuario.RepositorioUsuario;
import com.byebank.pix.domain.usuario.Telefone;
import com.byebank.pix.domain.usuario.TipoDocumento;
import com.byebank.pix.domain.usuario.Usuario;
import com.byebank.pix.infrastructure.mysql.ErrosMysql;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
@Profile("mysql")
public class RepositorioUsuarioMysql implements RepositorioUsuario {
    private static final RowMapper<Usuario> USUARIO = (linha, numero) -> Usuario.reconstituir(
            UUID.fromString(linha.getString("id")),
            linha.getString("nome_completo"),
            Documento.criar(TipoDocumento.valueOf(linha.getString("tipo_documento")), linha.getString("documento")),
            Email.criar(linha.getString("email")),
            Telefone.criar(linha.getString("telefone")),
            linha.getObject("criado_em", LocalDateTime.class).toInstant(ZoneOffset.UTC),
            linha.getObject("atualizado_em", LocalDateTime.class).toInstant(ZoneOffset.UTC));

    private final JdbcClient jdbc;

    public RepositorioUsuarioMysql(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Usuario inserir(Usuario usuario) {
        try {
            dadosCadastrais(jdbc.sql("""
                    INSERT INTO usuario (id, nome_completo, tipo_documento, documento, email, telefone,
                                         criado_em, atualizado_em)
                    VALUES (:id, :nome, :tipoDocumento, :documento, :email, :telefone, :criadoEm, :atualizadoEm)
                    """), usuario)
                    .param("tipoDocumento", usuario.getDocumento().tipo().name())
                    .param("documento", usuario.getDocumento().valor())
                    .param("criadoEm", LocalDateTime.ofInstant(usuario.getCriadoEm(), ZoneOffset.UTC))
                    .update();
            return usuario;
        } catch (DuplicateKeyException erro) {
            throw traduzirDuplicidade(erro);
        }
    }

    @Override
    public Usuario salvar(Usuario usuario) {
        try {
            int alterados = dadosCadastrais(jdbc.sql("""
                    UPDATE usuario SET nome_completo = :nome, email = :email, telefone = :telefone,
                                       atualizado_em = :atualizadoEm
                    WHERE id = :id AND status = 'ATIVO'
                    """), usuario).update();
            if (alterados == 0 && buscarPorId(usuario.getId()).isEmpty()) {
                throw new RecursoNaoEncontradoException("Usuário não encontrado.");
            }
            return usuario;
        } catch (DuplicateKeyException erro) {
            throw traduzirDuplicidade(erro);
        }
    }

    @Override
    public Optional<Usuario> buscarPorId(UUID id) {
        return jdbc.sql("""
                SELECT id, nome_completo, tipo_documento, documento, email, telefone, criado_em, atualizado_em
                FROM usuario WHERE id = :id AND status = 'ATIVO'
                """).param("id", id.toString()).query(USUARIO).optional();
    }

    @Override
    public boolean existePorDocumento(Documento documento) {
        return jdbc.sql("SELECT EXISTS (SELECT 1 FROM usuario WHERE documento = :documento)")
                .param("documento", documento.valor()).query(Boolean.class).single();
    }

    @Override
    public void remover(Usuario usuario) {
        try {
            jdbc.sql("DELETE FROM usuario WHERE id = :id AND status = 'ATIVO'")
                    .param("id", usuario.getId().toString()).update();
        } catch (DataIntegrityViolationException erro) {
            if (ErrosMysql.referenciaEmUso(erro)) {
                throw new RegraDeNegocioException("O usuário possui registros vinculados e não pode ser removido.");
            }
            throw erro;
        }
    }

    private JdbcClient.StatementSpec dadosCadastrais(JdbcClient.StatementSpec consulta, Usuario usuario) {
        return consulta.param("id", usuario.getId().toString())
                .param("nome", usuario.getNomeCompleto())
                .param("email", usuario.getEmail().valor())
                .param("telefone", usuario.getTelefone().valor())
                .param("atualizadoEm", LocalDateTime.ofInstant(usuario.getAtualizadoEm(), ZoneOffset.UTC));
    }

    private RuntimeException traduzirDuplicidade(DuplicateKeyException erro) {
        if (ErrosMysql.indiceDuplicado(erro, "uk_usuario_documento")) {
            return new RegraDeNegocioException("Já existe um usuário cadastrado com este documento.");
        }
        if (ErrosMysql.indiceDuplicado(erro, "uk_usuario_email")) {
            return new RegraDeNegocioException("Já existe um usuário cadastrado com este e-mail.");
        }
        return erro;
    }
}
