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
        String valorDaChave = tipo == TipoChavePix.ALEATORIA ? UUID.randomUUID().toString() : valor;
        return materializar(UUID.randomUUID(), tipo, valorDaChave, Instant.now());
    }

    public static ChavePix reconstituir(UUID id, TipoChavePix tipo, String valor, Instant criadaEm, UUID contaId) {
        ChavePix chave = materializar(id, tipo, valor, criadaEm);
        chave.associar(contaId);
        return chave;
    }

    private static ChavePix materializar(UUID id, TipoChavePix tipo, String valor, Instant criadaEm) {
        return switch (tipo) {
            case CPF -> new ChavePixCpf(id, valor, criadaEm);
            case CNPJ -> new ChavePixCnpj(id, valor, criadaEm);
            case EMAIL -> new ChavePixEmail(id, valor, criadaEm);
            case TELEFONE -> new ChavePixTelefone(id, valor, criadaEm);
            case ALEATORIA -> new ChavePixAleatoria(id, valor, criadaEm);
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
