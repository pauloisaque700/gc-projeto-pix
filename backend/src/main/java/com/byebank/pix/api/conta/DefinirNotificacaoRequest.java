package com.byebank.pix.api.conta;

import jakarta.validation.constraints.Pattern;

public record DefinirNotificacaoRequest(@Pattern(regexp = "EMAIL|SMS") String canal) {
}
