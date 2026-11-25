package com.byebank.pix.domain.pix;

import com.byebank.pix.domain.comum.EntidadeBase;
import com.byebank.pix.domain.conta.Dinheiro;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.UUID;

public final class TransferenciaPix extends EntidadeBase {
    private final UUID contaOrigemId;
    private final UUID contaDestinoId;
    private final String chaveDestinoUtilizada;
    private final Dinheiro valor;
    private final String origemExterna;
    private final Instant realizadaEm;

    private TransferenciaPix(UUID id, UUID contaOrigemId, UUID contaDestinoId, String chaveDestinoUtilizada,
                              Dinheiro valor, String origemExterna, Instant realizadaEm) {
        super(id);
        this.contaOrigemId = contaOrigemId;
        this.contaDestinoId = Objects.requireNonNull(contaDestinoId, "A conta de destino é obrigatória.");
        this.chaveDestinoUtilizada = Objects.requireNonNull(chaveDestinoUtilizada, "A chave PIX utilizada é obrigatória.");
        this.valor = Objects.requireNonNull(valor, "O valor da transferência é obrigatório.");
        if (!valor.ehPositivo()) {
            throw new IllegalArgumentException("O valor de uma transferência PIX deve ser positivo.");
        }
        this.origemExterna = origemExterna;
        this.realizadaEm = Objects.requireNonNull(realizadaEm, "A data de realização é obrigatória.");
    }

    public static TransferenciaPix registrarEntreContas(UUID contaOrigemId, UUID contaDestinoId,
                                                          String chaveDestinoUtilizada, Dinheiro valor) {
        Objects.requireNonNull(contaOrigemId, "A conta de origem é obrigatória.");
        return new TransferenciaPix(UUID.randomUUID(), contaOrigemId, contaDestinoId, chaveDestinoUtilizada,
                valor, null, Instant.now().truncatedTo(ChronoUnit.MICROS));
    }

    public static TransferenciaPix registrarRecebimentoExterno(UUID contaDestinoId, String chaveDestinoUtilizada,
                                                                 Dinheiro valor, String origemExterna) {
        String descricao = (origemExterna == null || origemExterna.isBlank())
                ? "Instituição externa"
                : origemExterna.trim();
        return new TransferenciaPix(UUID.randomUUID(), null, contaDestinoId, chaveDestinoUtilizada,
                valor, descricao, Instant.now().truncatedTo(ChronoUnit.MICROS));
    }

    public static TransferenciaPix reconstituir(UUID id, UUID contaOrigemId, UUID contaDestinoId,
                                                String chaveDestinoUtilizada, Dinheiro valor, String origemExterna,
                                                Instant realizadaEm) {
        return new TransferenciaPix(id, contaOrigemId, contaDestinoId, chaveDestinoUtilizada, valor,
                origemExterna, realizadaEm);
    }

    public boolean ehRecebimentoExterno() {
        return contaOrigemId == null;
    }

    public UUID getContaOrigemId() {
        return contaOrigemId;
    }

    public UUID getContaDestinoId() {
        return contaDestinoId;
    }

    public String getChaveDestinoUtilizada() {
        return chaveDestinoUtilizada;
    }

    public Dinheiro getValor() {
        return valor;
    }

    public String getOrigemExterna() {
        return origemExterna;
    }

    public Instant getRealizadaEm() {
        return realizadaEm;
    }
}
