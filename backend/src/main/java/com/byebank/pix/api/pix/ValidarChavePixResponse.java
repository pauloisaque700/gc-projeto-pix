package com.byebank.pix.api.pix;

import com.byebank.pix.application.pix.ResultadoValidacaoChavePix;

public record ValidarChavePixResponse(
        String tipo,
        String valorNormalizado,
        boolean valida,
        boolean disponivelParaAssociacao
) {
    public static ValidarChavePixResponse de(ResultadoValidacaoChavePix resultado) {
        return new ValidarChavePixResponse(
                resultado.tipo().name(),
                resultado.valor(),
                resultado.valida(),
                resultado.disponivel()
        );
    }
}