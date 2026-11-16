package com.byebank.pix.api.conta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DefinirStatusRequest(@NotBlank @Pattern(regexp = "ATIVA|BLOQUEADA") String status) {
}
