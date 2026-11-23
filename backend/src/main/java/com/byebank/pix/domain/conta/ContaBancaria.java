package com.byebank.pix.domain.conta;

import java.math.BigDecimal;
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
    private TipoConta tipoConta;
    private Dinheiro limiteDiario;
    private CanalNotificacao notificacao;
    private StatusConta status;
    private Instant atualizadaEm;

    private ContaBancaria(UUID id, UUID usuarioId, String agencia, String numero, Dinheiro saldo,
                          TipoConta tipoConta, Dinheiro limiteDiario, CanalNotificacao notificacao, StatusConta status,
                          Instant criadaEm, Instant atualizadaEm) {
        this.id = Objects.requireNonNull(id, "O identificador da conta é obrigatório.");
        this.usuarioId = Objects.requireNonNull(usuarioId, "O titular da conta é obrigatório.");
        this.agencia = validarAgencia(agencia);
        this.numero = validarNumero(numero);
        this.saldo = Objects.requireNonNull(saldo, "O saldo é obrigatório.");
        if (saldo.ehNegativo()) {
            throw new IllegalArgumentException("O saldo da conta não pode ser negativo.");
        }
        this.tipoConta = Objects.requireNonNull(tipoConta, "O tipo da conta é obrigatório.");
        this.limiteDiario = validarLimiteDiario(limiteDiario);
        this.notificacao = notificacao;
        this.status = Objects.requireNonNull(status, "O status da conta é obrigatório.");
        this.criadaEm = Objects.requireNonNull(criadaEm, "A data de criação é obrigatória.");
        this.atualizadaEm = Objects.requireNonNull(atualizadaEm, "A data de atualização é obrigatória.");
    }

    public static ContaBancaria criar(UUID usuarioId, String agencia, String numero) {
        return criar(usuarioId, agencia, numero, TipoConta.CORRENTE);
    }

    public static ContaBancaria criar(UUID usuarioId, String agencia, String numero, TipoConta tipoConta) {
        Instant agora = Instant.now();
        return new ContaBancaria(UUID.randomUUID(), usuarioId, agencia, numero, Dinheiro.zero(),
                tipoConta, Dinheiro.de(new BigDecimal("1000.00")), null, StatusConta.ATIVA, agora, agora);
    }

    public synchronized void definirLimiteDiario(Dinheiro novoLimite) {
        this.limiteDiario = validarLimiteDiario(novoLimite);
        this.atualizadaEm = Instant.now();
    }

    public void definirNotificacao(CanalNotificacao canal) {
        this.notificacao = canal;
        this.atualizadaEm = Instant.now();
    }

    public void bloquear() {
        if (status == StatusConta.BLOQUEADA) {
            throw new IllegalStateException("A conta já está bloqueada.");
        }
        status = StatusConta.BLOQUEADA;
        atualizadaEm = Instant.now();
    }

    public void desbloquear() {
        if (status == StatusConta.ATIVA) {
            throw new IllegalStateException("A conta já está ativa.");
        }
        status = StatusConta.ATIVA;
        atualizadaEm = Instant.now();
    }

    public void atualizarDados(String agencia, String numero) {
        String agenciaValidada = validarAgencia(agencia);
        String numeroValidado = validarNumero(numero);
        this.agencia = agenciaValidada;
        this.numero = numeroValidado;
        this.atualizadaEm = Instant.now();
    }

    /** Preparado para o recebimento PIX, que será exposto no módulo de transferências. */
    public void creditar(Dinheiro valor) {
        garantirContaAtiva();
        validarValorPositivo(valor);
        saldo = saldo.somar(valor);
        atualizadaEm = Instant.now();
    }

    /** Preparado para o envio PIX; evita que a conta fique com saldo negativo. */
    public void debitar(Dinheiro valor) {
        garantirContaAtiva();
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

    private void garantirContaAtiva() {
        if (status == StatusConta.BLOQUEADA) {
            throw new IllegalStateException("Conta bloqueada: não é possível realizar a operação.");
        }
    }

    private static Dinheiro validarLimiteDiario(Dinheiro limite) {
        Objects.requireNonNull(limite, "O limite diário é obrigatório.");
        if (limite.ehNegativo()) {
            throw new IllegalArgumentException("O limite diário não pode ser negativo.");
        }
        return limite;
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

    public TipoConta getTipoConta() {
        return tipoConta;
    }

    public Dinheiro getLimiteDiario() {
        return limiteDiario;
    }

    public CanalNotificacao getNotificacao() {
        return notificacao;
    }

    public StatusConta getStatus() {
        return status;
    }

    public Instant getCriadaEm() {
        return criadaEm;
    }

    public Instant getAtualizadaEm() {
        return atualizadaEm;
    }
}
