package com.byebank.pix.infrastructure.mysql;

import com.byebank.pix.BackendApplication;
import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.RepositorioContaBancaria;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.server.context.WebServerApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.jdbc.core.simple.JdbcClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@EnabledIfEnvironmentVariable(named = "BYEBANK_TEST_MYSQL_URL", matches = ".+")
class PersistenciaMysqlTest {
    private final JsonMapper json = JsonMapper.builder().build();

    @Test
    void devePersistirCadastroContaSaldoEPreferenciasAposReiniciarContexto() throws Exception {
        String usuarioId;
        String contaId;
        String dataCadastro;
        try (var contexto = iniciar(); var http = HttpClient.newHttpClient()) {
            var usuario = requisicao(contexto, http, "POST", "/api/usuarios",
                    cadastro("Pessoa Persistida", "52998224725", "PERSISTENCIA@EXAMPLE.TEST"), 201);
            usuarioId = usuario.path("id").asString();
            assertEquals("persistencia@example.test", usuario.path("email").asString());
            var consultado = requisicao(contexto, http, "GET", "/api/usuarios/" + usuarioId, null, 200);
            dataCadastro = consultado.path("criadoEm").asString();

            var conta = requisicao(contexto, http, "POST", "/api/contas", novaConta(usuarioId, "0001"), 201);
            contaId = conta.path("id").asString();
            assertEquals(usuarioId, conta.path("usuarioId").asString());
            assertEquals("Pessoa Persistida", conta.path("nomeTitular").asString());
            assertTrue(conta.path("numero").asString().matches("[0-9]{6}"));
            assertEquals(0, conta.path("saldo").decimalValue().compareTo(BigDecimal.ZERO));
            assertTrue(conta.path("notificacao").isNull());

            requisicao(contexto, http, "PUT", "/api/usuarios/" + usuarioId,
                    """
                    {"nomeCompleto":"Pessoa Atualizada","email":"persistencia@example.test","telefone":"85999999992"}
                    """, 200);
            requisicao(contexto, http, "PATCH", "/api/contas/" + contaId + "/limite-diario",
                    "{\"limiteDiario\":150.50}", 200);
            requisicao(contexto, http, "PATCH", "/api/contas/" + contaId + "/notificacao",
                    "{\"canal\":\"SMS\"}", 200);
            requisicao(contexto, http, "PATCH", "/api/contas/" + contaId + "/status",
                    "{\"status\":\"BLOQUEADA\"}", 200);

            JdbcClient jdbc = contexto.getBean(JdbcClient.class);
            assertEquals("Pessoa Atualizada", jdbc.sql("SELECT nome_completo FROM usuario WHERE id = :id")
                    .param("id", usuarioId).query(String.class).single());
            assertEquals(new BigDecimal("0.00"), jdbc.sql("SELECT saldo FROM conta_bancaria WHERE id = :id")
                    .param("id", contaId).query(BigDecimal.class).single());
        }

        try (var contexto = iniciar(); var http = HttpClient.newHttpClient()) {
            var usuario = requisicao(contexto, http, "GET", "/api/usuarios/" + usuarioId, null, 200);
            assertEquals("Pessoa Atualizada", usuario.path("nomeCompleto").asString());
            assertEquals(dataCadastro, usuario.path("criadoEm").asString());
            var conta = requisicao(contexto, http, "GET", "/api/contas/" + contaId, null, 200);
            assertEquals(usuarioId, conta.path("usuarioId").asString());
            assertEquals("Pessoa Atualizada", conta.path("nomeTitular").asString());
            assertEquals(0, conta.path("saldo").decimalValue().compareTo(BigDecimal.ZERO));
            assertEquals(0, conta.path("limiteDiario").decimalValue().compareTo(new BigDecimal("150.50")));
            assertEquals("SMS", conta.path("notificacao").asString());
            assertEquals("BLOQUEADA", conta.path("status").asString());
            var contas = requisicao(contexto, http, "GET", "/api/usuarios/" + usuarioId + "/contas", null, 200);
            assertEquals(1, contas.size());
            assertEquals(contaId, contas.get(0).path("id").asString());
            requisicao(contexto, http, "GET", "/api/contas/" + contaId + "/chaves-pix", null, 404);
            requisicao(contexto, http, "GET", "/api/contas/" + contaId + "/extrato-pix", null, 404);
        }
    }

    @Test
    void deveManterValidacoesUnicidadeEChavesEstrangeiras() throws Exception {
        try (var contexto = iniciar(); var http = HttpClient.newHttpClient()) {
            String inexistente = UUID.randomUUID().toString();
            requisicao(contexto, http, "POST", "/api/usuarios", "{}", 400);
            requisicao(contexto, http, "POST", "/api/usuarios",
                    cadastro("Documento Inválido", "11111111111", "cpf-invalido@example.test"), 422);
            requisicao(contexto, http, "GET", "/api/usuarios/" + inexistente, null, 404);
            requisicao(contexto, http, "GET", "/api/contas/" + inexistente, null, 404);
            requisicao(contexto, http, "POST", "/api/contas", novaConta(inexistente, "0001"), 404);
            requisicao(contexto, http, "POST", "/api/contas", novaConta(inexistente, "abc"), 400);

            String usuarioId = requisicao(contexto, http, "POST", "/api/usuarios",
                    cadastro("Pessoa Restrições", "11144477735", "restricoes@example.test"), 201).path("id").asString();
            var documento = requisicao(contexto, http, "POST", "/api/usuarios",
                    cadastro("Documento Repetido", "11144477735", "outro@example.test"), 422);
            assertEquals("Já existe um usuário cadastrado com este documento.", documento.path("mensagem").asString());
            var email = requisicao(contexto, http, "POST", "/api/usuarios",
                    cadastro("E-mail Repetido", "12345678909", "RESTRICOES@EXAMPLE.TEST"), 422);
            assertEquals("Já existe um usuário cadastrado com este e-mail.", email.path("mensagem").asString());

            var conta = requisicao(contexto, http, "POST", "/api/contas", novaConta(usuarioId, "0002"), 201);
            String contaId = conta.path("id").asString();
            RepositorioContaBancaria repositorio = contexto.getBean(RepositorioContaBancaria.class);
            assertThrows(RegraDeNegocioException.class, () -> repositorio.inserir(ContaBancaria.criar(
                    UUID.fromString(usuarioId), "0002", conta.path("numero").asString())));
            assertThrows(RecursoNaoEncontradoException.class, () -> repositorio.inserir(ContaBancaria.criar(
                    UUID.fromString(inexistente), "0003", "123456")));

            JdbcClient jdbc = contexto.getBean(JdbcClient.class);
            String logId = UUID.randomUUID().toString();
            jdbc.sql("INSERT INTO log_login (id, usuario_id, data_hora) VALUES (:id, :usuario, UTC_TIMESTAMP(6))")
                    .param("id", logId).param("usuario", usuarioId).update();
            requisicao(contexto, http, "DELETE", "/api/usuarios/" + usuarioId, null, 422);
            requisicao(contexto, http, "GET", "/api/contas/" + contaId, null, 200);
            jdbc.sql("DELETE FROM log_login WHERE id = :id").param("id", logId).update();
            requisicao(contexto, http, "DELETE", "/api/usuarios/" + usuarioId, null, 204);
            requisicao(contexto, http, "GET", "/api/usuarios/" + usuarioId, null, 404);
            requisicao(contexto, http, "GET", "/api/contas/" + contaId, null, 404);
        }
    }

    private ConfigurableApplicationContext iniciar() {
        String url = System.getenv("BYEBANK_TEST_MYSQL_URL");
        assertTrue(url.startsWith("jdbc:mysql:"), "Os testes exigem MySQL real.");
        return new SpringApplicationBuilder(BackendApplication.class)
                .run("--spring.profiles.active=mysql", "--server.address=127.0.0.1", "--server.port=0", "--debug=false",
                        "--spring.datasource.url=" + url,
                        "--spring.datasource.username=" + System.getenv("BYEBANK_TEST_MYSQL_USER"),
                        "--spring.datasource.password=" + System.getenv("BYEBANK_TEST_MYSQL_PASSWORD"));
    }

    private JsonNode requisicao(ConfigurableApplicationContext contexto, HttpClient http, String metodo,
                                String caminho, String corpo, int status) throws Exception {
        int porta = ((WebServerApplicationContext) contexto).getWebServer().getPort();
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + porta + caminho))
                .timeout(Duration.ofSeconds(10)).header("Content-Type", "application/json")
                .method(metodo, corpo == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(corpo))
                .build();
        var resposta = http.send(request, HttpResponse.BodyHandlers.ofString());
        assertEquals(status, resposta.statusCode(), resposta::body);
        return resposta.body().isEmpty() ? null : json.readTree(resposta.body());
    }

    private String cadastro(String nome, String cpf, String email) {
        return """
                {"nomeCompleto":"%s","tipoDocumento":"CPF","documento":"%s","email":"%s","telefone":"85999999991"}
                """.formatted(nome, cpf, email);
    }

    private String novaConta(String usuarioId, String agencia) {
        return """
                {"usuarioId":"%s","agencia":"%s","tipoConta":"CORRENTE"}
                """.formatted(usuarioId, agencia);
    }
}
