package com.byebank.pix.infrastructure.observabilidade;

import java.math.BigDecimal;
import java.time.Duration;

import org.springframework.stereotype.Component;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;

@Component
public class PixMetricas {

    private final MeterRegistry meterRegistry;

    public PixMetricas(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public void registrarOperacao(String operacao, String status, String tipoChave,
                                  BigDecimal valorBrl, Duration duracao) {
        String opNorm = normalizar(operacao, "desconhecida");
        String statusNorm = normalizar(status, "desconhecido");
        String tipoNorm = normalizar(tipoChave, "desconhecido");

        Counter.builder("byebank_pix_transfers_total")
                .description("Total de operações Pix processadas")
                .tag("operacao", opNorm)
                .tag("status", statusNorm)
                .tag("tipo_chave", tipoNorm)
                .register(meterRegistry)
                .increment();

        if (duracao != null) {
            Timer.builder("byebank_pix_transfer_duration_seconds")
                    .description("Duração das operações Pix")
                    .tag("operacao", opNorm)
                    .tag("status", statusNorm)
                    .tag("tipo_chave", tipoNorm)
                    .publishPercentileHistogram()
                    .register(meterRegistry)
                    .record(duracao);
        }

        if (valorBrl != null && valorBrl.compareTo(BigDecimal.ZERO) > 0) {
            double valor = valorBrl.doubleValue();

            Counter.builder("byebank_pix_volume_brl_total")
                    .description("Volume financeiro acumulado em BRL de operações Pix")
                    .tag("operacao", opNorm)
                    .tag("status", statusNorm)
                    .tag("tipo_chave", tipoNorm)
                    .register(meterRegistry)
                    .increment(valor);

            DistributionSummary.builder("byebank_pix_amount_brl")
                    .description("Distribuição do valor das operações Pix em BRL")
                    .baseUnit("BRL")
                    .tag("operacao", opNorm)
                    .tag("status", statusNorm)
                    .tag("tipo_chave", tipoNorm)
                    .publishPercentileHistogram()
                    .register(meterRegistry)
                    .record(valor);
        }
    }

    private String normalizar(String valor, String padrao) {
        if (valor == null || valor.isBlank()) {
            return padrao;
        }
        return valor.trim().toLowerCase();
    }
}