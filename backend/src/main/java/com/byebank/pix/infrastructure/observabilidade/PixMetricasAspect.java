package com.byebank.pix.infrastructure.observabilidade;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import com.byebank.pix.application.pix.ReceberPixExternoCommand;
import com.byebank.pix.application.pix.TransferirPixCommand;

@Aspect
@Component
public class PixMetricasAspect {

    private final PixMetricas pixMetricas;

    public PixMetricasAspect(PixMetricas pixMetricas) {
        this.pixMetricas = pixMetricas;
    }

    @Around("execution(* com.byebank.pix.application.pix.ServicoTransferenciaPix.transferir(..)) && args(comando)")
    public Object medirTransferencia(ProceedingJoinPoint pjp, TransferirPixCommand comando) throws Throwable {
        Instant inicio = Instant.now();
        BigDecimal valor = comando != null ? comando.valor() : null;
        String tipoChave = inferirTipoChave(comando != null ? comando.chaveDestino() : null);

        try {
            Object resultado = pjp.proceed();
            pixMetricas.registrarOperacao(
                    "transferencia_interna",
                    "sucesso",
                    tipoChave,
                    valor,
                    Duration.between(inicio, Instant.now())
            );
            return resultado;
        } catch (Throwable ex) {
            pixMetricas.registrarOperacao(
                    "transferencia_interna",
                    "falha",
                    tipoChave,
                    valor,
                    Duration.between(inicio, Instant.now())
            );
            throw ex;
        }
    }

    @Around("execution(* com.byebank.pix.application.pix.ServicoTransferenciaPix.receberExterno(..)) && args(comando)")
    public Object medirRecebimentoExterno(ProceedingJoinPoint pjp, ReceberPixExternoCommand comando) throws Throwable {
        Instant inicio = Instant.now();
        BigDecimal valor = comando != null ? comando.valor() : null;
        String tipoChave = inferirTipoChave(comando != null ? comando.chaveDestino() : null);

        try {
            Object resultado = pjp.proceed();
            pixMetricas.registrarOperacao(
                    "recebimento_externo",
                    "sucesso",
                    tipoChave,
                    valor,
                    Duration.between(inicio, Instant.now())
            );
            return resultado;
        } catch (Throwable ex) {
            pixMetricas.registrarOperacao(
                    "recebimento_externo",
                    "falha",
                    tipoChave,
                    valor,
                    Duration.between(inicio, Instant.now())
            );
            throw ex;
        }
    }

    private String inferirTipoChave(String chave) {
        if (chave == null || chave.isBlank()) {
            return "nao_informada";
        }
        return "chave_informada";
    }
}