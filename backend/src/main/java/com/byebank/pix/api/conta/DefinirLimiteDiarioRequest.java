package com.byebank.pix.api.conta;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record DefinirLimiteDiarioRequest(@NotNull @DecimalMin("0.00") BigDecimal limiteDiario) {
}
