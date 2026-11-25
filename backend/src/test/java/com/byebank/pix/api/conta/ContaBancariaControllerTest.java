package com.byebank.pix.api.conta;

import com.byebank.pix.api.comum.ManipuladorDeExcecoesApi;
import com.byebank.pix.application.conta.CadastroContaBancariaCommand;
import com.byebank.pix.application.conta.ServicoContaBancaria;
import com.byebank.pix.domain.usuario.Documento;
import com.byebank.pix.domain.usuario.Email;
import com.byebank.pix.domain.usuario.Telefone;
import com.byebank.pix.domain.usuario.TipoDocumento;
import com.byebank.pix.domain.usuario.Usuario;
import com.byebank.pix.infrastructure.conta.RepositorioContaBancariaEmMemoria;
import com.byebank.pix.infrastructure.pix.RepositorioChavePixEmMemoria;
import com.byebank.pix.infrastructure.pix.RepositorioTransferenciaPixEmMemoria;
import com.byebank.pix.infrastructure.usuario.RepositorioUsuarioEmMemoria;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ContaBancariaControllerTest {
    private MockMvc mvc;
    private UUID usuarioId;
    private UUID contaId;
    private String numeroConta;

    @BeforeEach
    void preparar() {
        var usuarios = new RepositorioUsuarioEmMemoria();
        var usuario = usuarios.salvar(Usuario.cadastrar("Maria da Silva",
                Documento.criar(TipoDocumento.CPF, "529.982.247-25"),
                Email.criar("maria@exemplo.com"), Telefone.criar("88999990000")));
        usuarioId = usuario.getId();
        var servico = new ServicoContaBancaria(new RepositorioContaBancariaEmMemoria(), usuarios,
                new RepositorioChavePixEmMemoria(), new RepositorioTransferenciaPixEmMemoria());
        var conta = servico.cadastrar(new CadastroContaBancariaCommand(usuarioId, "0001", null));
        contaId = conta.getId();
        numeroConta = conta.getNumero();
        mvc = MockMvcBuilders.standaloneSetup(new ContaBancariaController(servico))
                .setControllerAdvice(new ManipuladorDeExcecoesApi()).build();
    }

    @Test
    void deveExporNovosCamposAoCriarConsultarListarEAtualizar() throws Exception {
        mvc.perform(post("/api/contas").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"usuarioId":"%s","agencia":"0001","tipoConta":"POUPANCA"}
                        """.formatted(usuarioId)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.tipoConta").value("POUPANCA"))
                .andExpect(jsonPath("$.numero").value(matchesPattern("[0-9]{6}")))
                .andExpect(jsonPath("$.nomeTitular").value("Maria da Silva"));
        mvc.perform(get("/api/contas/{id}", contaId))
                .andExpect(status().isOk()).andExpect(jsonPath("$.tipoConta").value("CORRENTE"))
                .andExpect(jsonPath("$.limiteDiario").value(1000)).andExpect(jsonPath("$.status").value("ATIVA"));
        mvc.perform(get("/api/usuarios/{id}/contas", usuarioId))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].nomeTitular").value("Maria da Silva"));
        mvc.perform(put("/api/contas/{id}", contaId).contentType(MediaType.APPLICATION_JSON)
                .content("{\"agencia\":\"0002\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nomeTitular").value("Maria da Silva"))
                .andExpect(jsonPath("$.agencia").value("0002")).andExpect(jsonPath("$.numero").value(numeroConta));
    }

    @Test
    void deveAceitarNumeroAtualERejeitarOutroNumero() throws Exception {
        mvc.perform(put("/api/contas/{id}", contaId).contentType(MediaType.APPLICATION_JSON)
                .content("{\"agencia\":\"0002\",\"numero\":\"123\"}"))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.mensagem").value("O número da conta não pode ser alterado."));
        mvc.perform(get("/api/contas/{id}", contaId))
                .andExpect(status().isOk()).andExpect(jsonPath("$.agencia").value("0001"))
                .andExpect(jsonPath("$.numero").value(numeroConta));
        mvc.perform(put("/api/contas/{id}", contaId).contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"agencia":"0002","numero":"%s"}
                        """.formatted(numeroConta)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.agencia").value("0002"))
                .andExpect(jsonPath("$.numero").value(numeroConta));
    }

    @Test
    void devePersistirPreferenciasEValidarTransicoesDeStatus() throws Exception {
        mvc.perform(patch("/api/contas/{id}/limite-diario", contaId).contentType(MediaType.APPLICATION_JSON)
                .content("{\"limiteDiario\":150.50}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.limiteDiario").value(150.50));
        mvc.perform(patch("/api/contas/{id}/notificacao", contaId).contentType(MediaType.APPLICATION_JSON)
                .content("{\"canal\":\"SMS\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.notificacao").value("SMS"));
        mvc.perform(patch("/api/contas/{id}/notificacao", contaId).contentType(MediaType.APPLICATION_JSON)
                .content("{\"canal\":null}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.notificacao").doesNotExist());
        for (String estado : new String[]{"BLOQUEADA", "ATIVA"}) {
            mvc.perform(patch("/api/contas/{id}/status", contaId).contentType(MediaType.APPLICATION_JSON)
                    .content("{\"status\":\"" + estado + "\"}"))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.status").value(estado));
            mvc.perform(patch("/api/contas/{id}/status", contaId).contentType(MediaType.APPLICATION_JSON)
                    .content("{\"status\":\"" + estado + "\"}"))
                    .andExpect(status().is(422));
        }
        mvc.perform(get("/api/contas/{id}", contaId))
                .andExpect(jsonPath("$.limiteDiario").value(150.50));
    }

    @Test
    void deveRejeitarCamposInvalidosEContaInexistente() throws Exception {
        for (String[] caso : new String[][]{
                {"limite-diario", "{}"}, {"limite-diario", "{\"limiteDiario\":-1}"},
                {"notificacao", "{\"canal\":\"PUSH\"}"}, {"status", "{}"},
                {"status", "{\"status\":\"INVALIDO\"}"}}) {
            mvc.perform(patch("/api/contas/{id}/" + caso[0], contaId)
                    .contentType(MediaType.APPLICATION_JSON).content(caso[1]))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/contas").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"usuarioId":"%s","agencia":"1","tipoConta":"INVALIDO"}
                        """.formatted(usuarioId))).andExpect(status().isBadRequest());
        mvc.perform(patch("/api/contas/{id}/status", UUID.randomUUID()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"BLOQUEADA\"}")).andExpect(status().isNotFound());
    }
}
