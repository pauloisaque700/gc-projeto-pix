package com.byebank.pix.domain.usuario;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/** Entidade de domínio responsável pelos dados cadastrais do usuário. */
public final class Usuario {
    private final UUID id;
    private final Documento documento;
    private final Instant criadoEm;
    private String nomeCompleto;
    private Email email;
    private Telefone telefone;
    private Instant atualizadoEm;

    private Usuario(UUID id, String nomeCompleto, Documento documento, Email email, Telefone telefone,
                    Instant criadoEm, Instant atualizadoEm) {
        this.id = Objects.requireNonNull(id, "O identificador é obrigatório.");
        this.nomeCompleto = validarNome(nomeCompleto);
        this.documento = Objects.requireNonNull(documento, "O documento é obrigatório.");
        this.email = Objects.requireNonNull(email, "O e-mail é obrigatório.");
        this.telefone = Objects.requireNonNull(telefone, "O telefone é obrigatório.");
        this.criadoEm = Objects.requireNonNull(criadoEm, "A data de criação é obrigatória.");
        this.atualizadoEm = Objects.requireNonNull(atualizadoEm, "A data de atualização é obrigatória.");
    }

    public static Usuario cadastrar(String nomeCompleto, Documento documento, Email email, Telefone telefone) {
        Instant agora = Instant.now();
        return new Usuario(UUID.randomUUID(), nomeCompleto, documento, email, telefone, agora, agora);
    }

    public void atualizarDados(String nomeCompleto, Email email, Telefone telefone) {
        this.nomeCompleto = validarNome(nomeCompleto);
        this.email = Objects.requireNonNull(email, "O e-mail é obrigatório.");
        this.telefone = Objects.requireNonNull(telefone, "O telefone é obrigatório.");
        this.atualizadoEm = Instant.now();
    }

    private static String validarNome(String nomeCompleto) {
        if (nomeCompleto == null || nomeCompleto.isBlank()) {
            throw new IllegalArgumentException("O nome completo é obrigatório.");
        }
        String nomeNormalizado = nomeCompleto.trim().replaceAll("\\s+", " ");
        if (nomeNormalizado.length() > 150) {
            throw new IllegalArgumentException("O nome completo deve ter no máximo 150 caracteres.");
        }
        return nomeNormalizado;
    }

    public UUID getId() {
        return id;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public Documento getDocumento() {
        return documento;
    }

    public Email getEmail() {
        return email;
    }

    public Telefone getTelefone() {
        return telefone;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }
}
