package com.byebank.pix.api;

import com.byebank.pix.api.comum.ManipuladorDeExcecoesApi;
import com.byebank.pix.api.conta.ContaBancariaController;
import com.byebank.pix.api.pix.ChavePixController;
import com.byebank.pix.api.pix.TransferenciaPixController;
import com.byebank.pix.api.usuario.UsuarioController;
import com.byebank.pix.application.conta.ServicoContaBancaria;
import com.byebank.pix.application.pix.ServicoChavePix;
import com.byebank.pix.application.pix.ServicoTransferenciaPix;
import com.byebank.pix.application.usuario.ServicoUsuario;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.Dinheiro;
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
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.net.URI;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class IntegridadeRecursosHttpTest {
    private MockMvc mvc;
    private ContaBancaria contaPessoa;
    private ContaBancaria contaEmpresa;
    private ContaBancaria contaSemMovimento;

    @BeforeEach
    void preparar() {
        var usuarios = new RepositorioUsuarioEmMemoria();
        var contas = new RepositorioContaBancariaEmMemoria();
        var chaves = new RepositorioChavePixEmMemoria();
        var transferencias = new RepositorioTransferenciaPixEmMemoria();
        var pessoa = usuarios.salvar(Usuario.cadastrar("Pessoa Teste",
                Documento.criar(TipoDocumento.CPF, "52998224725"),
                Email.criar("pessoa@example.test"), Telefone.criar("11912345001")));
        var empresa = usuarios.salvar(Usuario.cadastrar("Empresa Teste",
                Documento.criar(TipoDocumento.CNPJ, "11222333000181"),
                Email.criar("empresa@example.test"), Telefone.criar("21912345002")));
        contaPessoa = contas.salvar(ContaBancaria.criar(pessoa.getId(), "0001", "100001"));
        contaEmpresa = contas.salvar(ContaBancaria.criar(empresa.getId(), "0001", "100002"));
        contaSemMovimento = contas.salvar(ContaBancaria.criar(pessoa.getId(), "0001", "100003"));
        var servicoConta = new ServicoContaBancaria(contas, usuarios, chaves, transferencias);
        mvc = MockMvcBuilders.standaloneSetup(
                new UsuarioController(new ServicoUsuario(usuarios, servicoConta)),
                new ContaBancariaController(servicoConta),
                new ChavePixController(new ServicoChavePix(chaves, contas, usuarios)),
                new TransferenciaPixController(new ServicoTransferenciaPix(contas, chaves, transferencias)))
                .setControllerAdvice(new ManipuladorDeExcecoesApi()).build();
    }

    @Test
    void deveConferirCpfECnpjComDocumentoDoTitularDaConta() throws Exception {
        associarChave(contaPessoa, "CPF", "11144477735")
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.mensagem").value("A chave PIX do tipo CPF deve corresponder ao documento do titular da conta."));
        associarChave(contaEmpresa, "CNPJ", "11444777000161")
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.mensagem").value("A chave PIX do tipo CNPJ deve corresponder ao documento do titular da conta."));
        mvc.perform(get("/api/contas/{id}/chaves-pix", contaPessoa.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/contas/{id}/chaves-pix", contaEmpresa.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));

        associarChave(contaPessoa, "CPF", "52998224725")
                .andExpect(status().isCreated()).andExpect(jsonPath("$.contaId").value(contaPessoa.getId().toString()));
        associarChave(contaEmpresa, "CNPJ", "11222333000181")
                .andExpect(status().isCreated()).andExpect(jsonPath("$.contaId").value(contaEmpresa.getId().toString()));
    }

    @Test
    void deveConsultarChaveVinculadaEAposRemocaoRetornarNaoEncontrado() throws Exception {
        String localizacao = associarChave(contaPessoa, "EMAIL", "contato@example.test")
                .andExpect(status().isCreated()).andReturn().getResponse().getHeader("Location");
        URI chave = URI.create(localizacao);
        mvc.perform(get(chave)).andExpect(status().isOk())
                .andExpect(jsonPath("$.contaId").value(contaPessoa.getId().toString()));
        mvc.perform(delete(chave)).andExpect(status().isNoContent());
        mvc.perform(get(chave)).andExpect(status().isNotFound());
    }

    @Test
    void deveRefletirTransferenciaNosExtratosDeOrigemEDestino() throws Exception {
        contaPessoa.creditar(Dinheiro.de(new BigDecimal("100.00")));
        associarChave(contaEmpresa, "EMAIL", "pagamento@example.test").andExpect(status().isCreated());
        mvc.perform(post("/api/pix/transferencias").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"contaOrigemId":"%s","chaveDestino":"pagamento@example.test","valor":15.50}
                        """.formatted(contaPessoa.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.contaOrigemId").value(contaPessoa.getId().toString()))
                .andExpect(jsonPath("$.contaDestinoId").value(contaEmpresa.getId().toString()));
        mvc.perform(get("/api/contas/{id}/extrato-pix", contaPessoa.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].valor").value(15.50));
        mvc.perform(get("/api/contas/{id}/extrato-pix", contaEmpresa.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].valor").value(15.50));
        mvc.perform(get("/api/contas/{id}/extrato-pix", contaSemMovimento.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void deveDistinguirUuidMalformadoDeRecursoInexistente() throws Exception {
        mvc.perform(get("/api/contas/{id}", "invalido"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.id").value("O parâmetro tem formato inválido."));
        mvc.perform(post("/api/contas").contentType(MediaType.APPLICATION_JSON)
                .content("{\"usuarioId\":\"invalido\",\"agencia\":\"0001\"}"))
                .andExpect(status().isBadRequest());
        UUID ausente = UUID.randomUUID();
        for (String rota : new String[]{"/api/usuarios/{id}", "/api/usuarios/{id}/contas",
                "/api/contas/{id}", "/api/contas/{id}/chaves-pix", "/api/chaves-pix/{id}",
                "/api/contas/{id}/extrato-pix", "/api/pix/transferencias/{id}"}) {
            mvc.perform(get(rota, ausente)).andExpect(status().isNotFound());
        }
    }

    private ResultActions associarChave(ContaBancaria conta, String tipo, String valor) throws Exception {
        return mvc.perform(post("/api/chaves-pix").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"contaId":"%s","tipo":"%s","valor":"%s"}
                        """.formatted(conta.getId(), tipo, valor)));
    }
}
