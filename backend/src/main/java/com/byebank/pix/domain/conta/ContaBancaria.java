package com.byebank.pix.domain.conta;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/** Conta de titularidade única nesta etapa do projeto. */
public final class ContaBancaria {
    private final UUID id;
    private final UUID usuarioId;
    private final Instant criadaEm;
    private String agencia;
    private String numero;
    private Dinheiro saldo;
    private Instant atualizadaEm;

    private ContaBancaria(UUID id, UUID usuarioId, String agencia, String numero, Dinheiro saldo,
                          Instant criadaEm, Instant atualizadaEm) {
        this.id = Objects.requireNonNull(id, "O identificador da conta é obrigatório.");
        this.usuarioId = Objects.requireNonNull(usuarioId, "O titular da conta é obrigatório.");
        this.agencia = validarAgencia(agencia);
        this.numero = validarNumero(numero);
        this.saldo = Objects.requireNonNull(saldo, "O saldo é obrigatório.");
        if (saldo.ehNegativo()) {
            throw new IllegalArgumentException("O saldo da conta não pode ser negativo.");
        }
        this.criadaEm = Objects.requireNonNull(criadaEm, "A data de criação é obrigatória.");
        this.atualizadaEm = Objects.requireNonNull(atualizadaEm, "A data de atualização é obrigatória.");
    }

    public static ContaBancaria criar(UUID usuarioId, String agencia, String numero) {
        Instant agora = Instant.now();
        return new ContaBancaria(UUID.randomUUID(), usuarioId, agencia, numero, Dinheiro.zero(), agora, agora);
    }

    public void atualizarDados(String agencia, String numero) {
        this.agencia = validarAgencia(agencia);
        this.numero = validarNumero(numero);
        this.atualizadaEm = Instant.now();
    }

    /** Preparado para o recebimento PIX, que será exposto no módulo de transferências. */
    public void creditar(Dinheiro valor) {
        validarValorPositivo(valor);
        saldo = saldo.somar(valor);
        atualizadaEm = Instant.now();
    }

    /** Preparado para o envio PIX; evita que a conta fique com saldo negativo. */
    public void debitar(Dinheiro valor) {
        validarValorPositivo(valor);
        if (!saldo.ehMaiorOuIgualA(valor)) {
            throw new IllegalStateException("Saldo insuficiente para realizar a operação.");
        }
        saldo = saldo.subtrair(valor);
        atualizadaEm = Instant.now();
    }

    public boolean temSaldoSuficiente(Dinheiro valor) {
        return saldo.ehMaiorOuIgualA(valor);
    }

    private static void validarValorPositivo(Dinheiro valor) {
        if (valor == null || !valor.ehPositivo()) {
            throw new IllegalArgumentException("O valor da operação deve ser positivo.");
        }
    }

    private static String validarAgencia(String agencia) {
        return validarCodigo("A agência", agencia, 10);
    }

    private static String validarNumero(String numero) {
        return validarCodigo("O número da conta", numero, 20);
    }

    private static String validarCodigo(String rotulo, String valor, int tamanhoMaximo) {
        if (valor == null || !valor.matches("\\d{1," + tamanhoMaximo + "}")) {
            throw new IllegalArgumentException(rotulo + " deve conter somente dígitos.");
        }
        return valor;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public String getAgencia() {
        return agencia;
    }

    public String getNumero() {
        return numero;
    }

    public Dinheiro getSaldo() {
        return saldo;
    }

    public Instant getCriadaEm() {
        return criadaEm;
    }

    public Instant getAtualizadaEm() {
        return atualizadaEm;
    }
}
