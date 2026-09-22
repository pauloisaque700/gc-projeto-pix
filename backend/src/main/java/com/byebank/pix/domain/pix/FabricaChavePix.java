package com.byebank.pix.domain.pix;

import java.time.Instant;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

public final class FabricaChavePix {

    private static final Pattern PADRAO_UUID = Pattern.compile(
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    );

    private FabricaChavePix() {
    }

    public static ChavePix criar(TipoChavePix tipo, String valor) {
        Objects.requireNonNull(tipo, "O tipo da chave PIX é obrigatório.");
        UUID id = UUID.randomUUID();
        Instant agora = Instant.now();

        return switch (tipo) {
            case CPF -> new ChavePixCpf(id, valor, agora);
            case CNPJ -> new ChavePixCnpj(id, valor, agora);
            case EMAIL -> new ChavePixEmail(id, valor, agora);
            case TELEFONE -> new ChavePixTelefone(id, valor, agora);
            case ALEATORIA -> new ChavePixAleatoria(id, UUID.randomUUID().toString(), agora);
        };
    }

    public static String normalizarParaBusca(String valorDigitado) {
        if (valorDigitado == null || valorDigitado.isBlank()) {
            throw new IllegalArgumentException("A chave PIX é obrigatória.");
        }
        String valor = valorDigitado.trim();

        if (valor.contains("@")) {
            return valor.toLowerCase(Locale.ROOT);
        }
        if (PADRAO_UUID.matcher(valor).matches()) {
            return valor.toLowerCase(Locale.ROOT);
        }
        String somenteDigitos = valor.replaceAll("\\D", "");
        return somenteDigitos.isEmpty() ? valor : somenteDigitos;
    }
}
