package com.byebank.pix.infrastructure.mysql;

import com.byebank.pix.BackendApplication;
import com.byebank.pix.domain.pix.RepositorioTransferenciaPix;
import com.byebank.pix.domain.pix.TransferenciaPix;
import com.byebank.pix.infrastructure.pix.RepositorioTransferenciaPixMysql;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.web.server.context.WebServerApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.simple.JdbcClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@EnabledIfEnvironmentVariable(named = "BYEBANK_TEST_MYSQL_URL", matches = ".+")
class PixMysqlTest {
    private static final AtomicInteger DOCUMENTOS = new AtomicInteger(900000000);
    private static final JsonMapper JSON = JsonMapper.builder().build();

    @Test
    void devePersistirChavesSaldoEExtratoAposReiniciar() throws Exception {
        ContaTeste origem;
        ContaTeste destino;
        String transferenciaId;
        String chaveAleatoriaId;
        try (var api = new Api()) {
            origem = api.criarConta("persist-pix-a", "0310");
            destino = api.criarConta("persist-pix-b", "0311");
            var aleatoria = api.esperar(201, "POST", "/api/chaves-pix/aleatoria",
                    "{\"contaId\":\"%s\"}".formatted(destino.id()));
            chaveAleatoriaId = aleatoria.path("id").asString();
            assertEquals("ALEATORIA", aleatoria.path("tipo").asString());
            assertEquals(2, api.esperar(200, "GET", "/api/contas/" + destino.id() + "/chaves-pix", null).size());
            api.esperar(422, "POST", "/api/chaves-pix", chave(origem, "EMAIL", destino.chave()));
            api.esperar(422, "POST", "/api/chaves-pix", chave(origem, "CPF", "52998224725"));
            api.esperar(422, "POST", "/api/chaves-pix", chave(origem, "CNPJ", "11222333000181"));
            api.esperar(201, "POST", "/api/chaves-pix", chave(origem, "CPF", origem.cpf()));
            api.esperar(201, "POST", "/api/chaves-pix", chave(origem, "TELEFONE", "85912345678"));
            api.creditar(origem, "150.00");
            api.creditar(destino, "20.00");
            api.verificarSaldos(origem, "150.00", destino, "20.00");
            transferenciaId = api.esperar(201, "POST", "/api/pix/transferencias",
                    transferencia(origem, destino.chave(), "50.00")).path("id").asString();
            api.verificarSaldos(origem, "100.00", destino, "70.00");
            api.esperar(422, "DELETE", "/api/contas/" + destino.id(), null);
            api.esperar(200, "GET", "/api/chaves-pix/" + chaveAleatoriaId, null);
        }
        try (var api = new Api()) {
            var chave = api.esperar(200, "GET", "/api/chaves-pix/" + chaveAleatoriaId, null);
            assertEquals(destino.id(), chave.path("contaId").asString());
            var encontrada = api.esperar(200, "GET",
                    "/api/chaves-pix/resolver?valor=" + destino.chave().replace("@", "%40"), null);
            assertEquals(destino.id(), encontrada.path("contaId").asString());
            api.verificarSaldos(origem, "100.00", destino, "70.00");
            var pix = api.esperar(200, "GET", "/api/pix/transferencias/" + transferenciaId, null);
            assertEquals(origem.id(), pix.path("contaOrigemId").asString());
            assertEquals(destino.id(), pix.path("contaDestinoId").asString());
            assertFalse(pix.path("recebimentoExterno").asBoolean());
            for (ContaTeste conta : List.of(origem, destino)) {
                var extrato = api.esperar(200, "GET", "/api/contas/" + conta.id() + "/extrato-pix", null);
                assertEquals(2, extrato.size());
                assertEquals(transferenciaId, extrato.get(0).path("id").asString());
            }
        }
    }

    @Test
    void deveRejeitarInvalidosEContasBloqueadasSemMovimentar() throws Exception {
        try (var api = new Api()) {
            var origem = api.criarConta("regras-pix-a", "0320");
            var destino = api.criarConta("regras-pix-b", "0321");
            api.creditar(origem, "10.00");
            api.esperar(422, "POST", "/api/pix/transferencias", transferencia(origem, destino.chave(), "11.00"));
            api.esperar(404, "POST", "/api/pix/transferencias", transferencia(origem, "inexistente@example.test", "1.00"));
            for (String valor : List.of("0", "-1")) {
                api.esperar(400, "POST", "/api/pix/transferencias", transferencia(origem, destino.chave(), valor));
            }
            for (ContaTeste bloqueada : List.of(origem, destino)) {
                api.status(bloqueada, "BLOQUEADA");
                api.esperar(422, "POST", "/api/pix/transferencias", transferencia(origem, destino.chave(), "1.00"));
                api.status(bloqueada, "ATIVA");
            }
            api.limite(origem, "5.00");
            api.esperar(422, "POST", "/api/pix/transferencias", transferencia(origem, destino.chave(), "6.00"));
            api.jdbc.sql("UPDATE chave_pix SET status = 'SUSPENSA' WHERE valor = :chave")
                    .param("chave", destino.chave()).update();
            api.esperar(404, "POST", "/api/pix/transferencias", transferencia(origem, destino.chave(), "1.00"));
            api.verificarSaldos(origem, "10.00", destino, "0.00");
            assertEquals(0, api.totalEnviado(origem));
        }
    }

    @Test
    void deveReverterSaldosERegistroSeFalharDepoisDaInclusao() throws Exception {
        try (var api = new Api(FalhaControlada.class)) {
            var origem = api.criarConta("rollback-pix-a", "0330");
            var destino = api.criarConta("rollback-pix-b", "0331");
            api.creditar(origem, "100.00");
            api.creditar(destino, "20.00");
            var erro = api.esperar(422, "POST", "/api/pix/transferencias", transferencia(origem, destino.chave(), "40.00"));
            assertEquals("Falha controlada após a inclusão do PIX.", erro.path("mensagem").asString());
            api.verificarSaldos(origem, "100.00", destino, "20.00");
            assertEquals(0, api.totalEnviado(origem));
        }
    }

    @Test
    void deveReverterDebitoQuandoMysqlRejeitarCredito() throws Exception {
        try (var api = new Api()) {
            var origem = api.criarConta("overflow-pix-a", "0332");
            var destino = api.criarConta("overflow-pix-b", "0333");
            api.creditar(origem, "100.00");
            api.creditar(destino, "9999999999999.99");
            api.esperar(500, "POST", "/api/pix/transferencias", transferencia(origem, destino.chave(), "1.00"));
            api.verificarSaldos(origem, "100.00", destino, "9999999999999.99");
            assertEquals(0, api.totalEnviado(origem));
        }
    }

    @Test
    void deveImpedirGastoDuplicadoDoMesmoSaldo() throws Exception {
        verificarDisputa("disputa-saldo", "0340", "0341", "100.00", "1000.00", "40.00", "Saldo insuficiente");
    }

    @Test
    void deveImpedirQueTransferenciasConcorrentesExcedamOLimiteDiario() throws Exception {
        verificarDisputa("disputa-limite", "0350", "0351", "200.00", "100.00", "140.00", "Limite diário");
    }

    @Test
    void deveConcluirTransferenciasSimultaneasEmSentidosOpostos() throws Exception {
        try (var api = new Api()) {
            var origem = api.criarConta("opostos-pix-a", "0360");
            var destino = api.criarConta("opostos-pix-b", "0361");
            api.creditar(origem, "100.00");
            api.creditar(destino, "100.00");
            var respostas = api.simultaneas(transferencia(origem, destino.chave(), "25.00"),
                    transferencia(destino, origem.chave(), "40.00"));
            assertEquals(List.of(201, 201), respostas.stream().map(Resposta::status).toList());
            api.verificarSaldos(origem, "115.00", destino, "85.00");
            assertEquals(1, api.totalEnviado(origem));
            assertEquals(1, api.totalEnviado(destino));
        }
    }

    private void verificarDisputa(String nome, String agenciaA, String agenciaB, String saldo, String limite,
                                  String saldoFinal, String mensagem) throws Exception {
        try (var api = new Api()) {
            var origem = api.criarConta(nome + "-a", agenciaA);
            var destino = api.criarConta(nome + "-b", agenciaB);
            api.creditar(origem, saldo);
            api.limite(origem, limite);
            String pedido = transferencia(origem, destino.chave(), "60.00");
            var respostas = api.simultaneas(pedido, pedido);
            assertEquals(List.of(201, 422), respostas.stream().map(Resposta::status).sorted().toList());
            var rejeicao = respostas.stream().filter(resposta -> resposta.status() == 422).findFirst().orElseThrow();
            assertTrue(rejeicao.corpo().path("mensagem").asString().contains(mensagem));
            api.verificarSaldos(origem, saldoFinal, destino, "60.00");
            assertEquals(1, api.totalEnviado(origem));
        }
    }

    private static String chave(ContaTeste conta, String tipo, String valor) {
        return """
                {"contaId":"%s","tipo":"%s","valor":"%s"}
                """.formatted(conta.id(), tipo, valor);
    }

    private static String transferencia(ContaTeste origem, String chaveDestino, String valor) {
        return """
                {"contaOrigemId":"%s","chaveDestino":"%s","valor":%s}
                """.formatted(origem.id(), chaveDestino, valor);
    }

    private static String cpf() {
        String base = String.format(Locale.ROOT, "%09d", DOCUMENTOS.incrementAndGet());
        return base + digito(base) + digito(base + digito(base));
    }

    private static int digito(String base) {
        int soma = 0;
        for (int i = 0; i < base.length(); i++) {
            soma += Character.digit(base.charAt(i), 10) * (base.length() + 1 - i);
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private record ContaTeste(String id, String chave, String cpf) {}
    private record Resposta(int status, JsonNode corpo) {}

    private static final class Api implements AutoCloseable {
        private final ConfigurableApplicationContext contexto;
        private final HttpClient cliente;
        private final JdbcClient jdbc;
        private final String endereco;

        private Api(Class<?>... configuracaoExtra) {
            String url = System.getenv("BYEBANK_TEST_MYSQL_URL");
            assertTrue(url.startsWith("jdbc:mysql:"), "O teste exige MySQL real.");
            contexto = new SpringApplicationBuilder(BackendApplication.class).sources(configuracaoExtra)
                    .run("--spring.profiles.active=mysql", "--server.address=127.0.0.1", "--server.port=0", "--debug=false",
                            "--spring.datasource.url=" + url,
                            "--spring.datasource.username=" + System.getenv("BYEBANK_TEST_MYSQL_USER"),
                            "--spring.datasource.password=" + System.getenv("BYEBANK_TEST_MYSQL_PASSWORD"));
            cliente = HttpClient.newHttpClient();
            jdbc = contexto.getBean(JdbcClient.class);
            endereco = "http://127.0.0.1:" + ((WebServerApplicationContext) contexto).getWebServer().getPort();
        }

        private ContaTeste criarConta(String nome, String agencia) throws Exception {
            String documento = cpf();
            String email = nome + "@example.test";
            String usuario = esperar(201, "POST", "/api/usuarios",
                    """
                    {"nomeCompleto":"%s","tipoDocumento":"CPF","documento":"%s","email":"%s","telefone":"85999999991"}
                    """.formatted(nome, documento, email)).path("id").asString();
            String id = esperar(201, "POST", "/api/contas",
                    "{\"usuarioId\":\"%s\",\"agencia\":\"%s\"}".formatted(usuario, agencia)).path("id").asString();
            var conta = new ContaTeste(id, email, documento);
            esperar(201, "POST", "/api/chaves-pix", chave(conta, "EMAIL", email));
            return conta;
        }

        private void creditar(ContaTeste conta, String valor) throws Exception {
            esperar(201, "POST", "/api/pix/recebimentos-externos",
                    """
                    {"chaveDestino":"%s","valor":%s,"origemExterna":"Crédito de teste"}
                    """.formatted(conta.chave(), valor));
        }

        private void limite(ContaTeste conta, String valor) throws Exception {
            esperar(200, "PATCH", "/api/contas/" + conta.id() + "/limite-diario",
                    "{\"limiteDiario\":%s}".formatted(valor));
        }

        private void status(ContaTeste conta, String estado) throws Exception {
            esperar(200, "PATCH", "/api/contas/" + conta.id() + "/status", "{\"status\":\"%s\"}".formatted(estado));
        }

        private void verificarSaldos(ContaTeste origem, String saldoOrigem, ContaTeste destino, String saldoDestino) {
            assertEquals(new BigDecimal(saldoOrigem), saldo(origem));
            assertEquals(new BigDecimal(saldoDestino), saldo(destino));
        }

        private BigDecimal saldo(ContaTeste conta) {
            return jdbc.sql("SELECT saldo FROM conta_bancaria WHERE id = :id")
                    .param("id", conta.id()).query(BigDecimal.class).single();
        }

        private int totalEnviado(ContaTeste conta) {
            return jdbc.sql("SELECT COUNT(*) FROM transferencia_pix WHERE conta_origem_id = :id")
                    .param("id", conta.id()).query(Integer.class).single();
        }

        private List<Resposta> simultaneas(String primeira, String segunda) throws Exception {
            try (var executor = Executors.newFixedThreadPool(2)) {
                var prontas = new CountDownLatch(2);
                var iniciar = new CountDownLatch(1);
                var tarefas = List.of(primeira, segunda).stream().map(pedido -> executor.submit(() -> {
                    prontas.countDown();
                    assertTrue(iniciar.await(5, TimeUnit.SECONDS));
                    return requisicao("POST", "/api/pix/transferencias", pedido);
                })).toList();
                assertTrue(prontas.await(5, TimeUnit.SECONDS));
                iniciar.countDown();
                return List.of(tarefas.get(0).get(12, TimeUnit.SECONDS), tarefas.get(1).get(12, TimeUnit.SECONDS));
            }
        }

        private JsonNode esperar(int esperado, String metodo, String caminho, String corpo) throws Exception {
            var resposta = requisicao(metodo, caminho, corpo);
            assertEquals(esperado, resposta.status(), () -> caminho + " " + resposta.corpo());
            return resposta.corpo();
        }

        private Resposta requisicao(String metodo, String caminho, String corpo) throws Exception {
            var pedido = HttpRequest.newBuilder(URI.create(endereco + caminho)).timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json").method(metodo,
                            corpo == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(corpo))
                    .build();
            var resposta = cliente.send(pedido, HttpResponse.BodyHandlers.ofString());
            return new Resposta(resposta.statusCode(), resposta.body().isBlank() ? null : JSON.readTree(resposta.body()));
        }

        @Override
        public void close() {
            cliente.close();
            contexto.close();
        }
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class FalhaControlada {
        @Bean
        @Primary
        RepositorioTransferenciaPix transferenciasComFalha(JdbcClient jdbc) {
            return new RepositorioTransferenciaPixMysql(jdbc) {
                @Override
                public TransferenciaPix salvar(TransferenciaPix transferencia) {
                    var salva = super.salvar(transferencia);
                    if (!salva.ehRecebimentoExterno()) {
                        throw new IllegalStateException("Falha controlada após a inclusão do PIX.");
                    }
                    return salva;
                }
            };
        }
    }
}
