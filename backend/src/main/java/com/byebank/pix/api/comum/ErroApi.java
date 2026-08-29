package com.byebank.pix.api.comum;

import java.time.Instant;
import java.util.Map;

public record ErroApi(
        Instant instante,
        int status,
        String erro,
        String mensagem,
        Map<String, String> campos
) {
}
