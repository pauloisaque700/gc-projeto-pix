package com.byebank.pix.application.conta;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.pix.AssociarChavePixCommand;
import com.byebank.pix.application.pix.ReceberPixExternoCommand;
import com.byebank.pix.application.pix.ServicoChavePix;
import com.byebank.pix.application.pix.ServicoTransferenciaPix;
import com.byebank.pix.application.pix.TransferirPixCommand;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.pix.TipoChavePix;
import com.byebank.pix.domain.pix.TransferenciaPix;
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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ServicoContaBancariaTest {
    private RepositorioUsuarioEmMemoria repositorioUsuario;
    private RepositorioContaBancariaEmMemoria repositorioConta;
    private RepositorioChavePixEmMemoria repositorioChave;
    private RepositorioTransferenciaPixEmMemoria repositorioTransferencia;
    private ServicoContaBancaria servicoConta;
    private ServicoChavePix servicoChave;
    private ServicoTransferenciaPix servicoTransferencia;
    private Usuario titular;

    @BeforeEach
    void preparar() {
        repositorioUsuario = new RepositorioUsuarioEmMemoria();
        repositorioConta = new RepositorioContaBancariaEmMemoria();
        repositorioChave = new RepositorioChavePixEmMemoria();
        repositorioTransferencia = new RepositorioTransferenciaPixEmMemoria();
        titular = Usuario.cadastrar(
                "Maria da Silva",
                Documento.criar(TipoDocumento.CPF, "529.982.247-25"),
                Email.criar("maria@exemplo.com"),
                Telefone.criar("88999990000")
        );
        repositorioUsuario.salvar(titular);
        servicoConta = new ServicoContaBancaria(
                repositorioConta, repositorioUsuario, repositorioChave, repositorioTransferencia
        );
        servicoChave = new ServicoChavePix(repositorioChave, repositorioConta, repositorioUsuario);
        servicoTransferencia = new ServicoTransferenciaPix(repositorioConta, repositorioChave, repositorioTransferencia);
    }

    @Test
    void deveCadastrarContaComSaldoZero() {
        ContaBancaria conta = criarConta();

        assertEquals(titular.getId(), conta.getUsuarioId());
        assertEquals("0.00", conta.getSaldo().valor().toPlainString());
    }

    @Test
    void deveTentarOutroNumeroAoEncontrarColisaoNaAgencia() {
        List<String> numerosConsultados = new ArrayList<>();
        RepositorioContaBancariaEmMemoria repositorioComColisao = new RepositorioContaBancariaEmMemoria() {
            @Override
            public boolean existePorAgenciaENumero(String agencia, String numero) {
                assertEquals("0001", agencia);
                numerosConsultados.add(numero);
                return numerosConsultados.size() == 1 || super.existePorAgenciaENumero(agencia, numero);
            }
        };
        ServicoContaBancaria servicoComColisao = new ServicoContaBancaria(
                repositorioComColisao, repositorioUsuario, repositorioChave, repositorioTransferencia
        );

        ContaBancaria conta = servicoComColisao.cadastrar(new CadastroContaBancariaCommand(titular.getId(), "0001", null));

        assertEquals(2, numerosConsultados.size());
        assertEquals(numerosConsultados.getLast(), conta.getNumero());
        assertEquals(conta, repositorioComColisao.buscarPorId(conta.getId()).orElseThrow());
    }

    @Test
    void deveLiberarIdentificacaoAnteriorAoAtualizarConta() {
        ContaBancaria conta = criarConta();
        String numeroAnterior = conta.getNumero();

        servicoConta.atualizar(conta.getId(), new AtualizacaoContaBancariaCommand("0002", numeroAnterior));

        assertFalse(repositorioConta.existePorAgenciaENumero("0001", numeroAnterior));
        assertTrue(repositorioConta.existePorAgenciaENumero("0002", numeroAnterior));
    }

    @Test
    void deveListarContasDoUsuario() {
        ContaBancaria primeiraConta = criarConta();
        ContaBancaria segundaConta = criarConta();

        assertNotEquals(primeiraConta.getNumero(), segundaConta.getNumero());
        assertEquals(2, servicoConta.listarPorUsuario(titular.getId()).size());
    }

    @Test
    void deveApagarChavesPixAoRemoverConta() {
        ContaBancaria conta = criarConta();
        associarEmail(conta, "a@exemplo.com");
        associarEmail(conta, "b@exemplo.com");

        servicoConta.remover(conta.getId());

        assertTrue(repositorioChave.listarPorContaId(conta.getId()).isEmpty());
        assertFalse(repositorioChave.existePorValor("a@exemplo.com"));
        assertFalse(repositorioChave.existePorValor("b@exemplo.com"));
        assertThrows(RecursoNaoEncontradoException.class, () -> servicoConta.buscarPorId(conta.getId()));
    }

    @Test
    void deveApagarTransferenciasOndeAContaEhOrigemOuDestino() {
        ContaBancaria contaA = criarConta();
        ContaBancaria contaB = criarConta();
        associarEmail(contaA, "a@exemplo.com");
        associarEmail(contaB, "b@exemplo.com");
        TransferenciaPix recebimento = servicoTransferencia.receberExterno(
                new ReceberPixExternoCommand("a@exemplo.com", new BigDecimal("100.00"), "Banco Externo")
        );
        servicoConta.definirLimiteDiario(contaA.getId(), new BigDecimal("500.00"));
        TransferenciaPix enviada = servicoTransferencia.transferir(
                new TransferirPixCommand(contaA.getId(), "b@exemplo.com", new BigDecimal("40.00"))
        );

        servicoConta.remover(contaA.getId());

        assertTrue(repositorioTransferencia.buscarPorId(recebimento.getId()).isEmpty());
        assertTrue(repositorioTransferencia.buscarPorId(enviada.getId()).isEmpty());
        assertTrue(repositorioTransferencia.listarPorConta(contaB.getId()).isEmpty());
        assertEquals(contaB.getId(), servicoConta.buscarPorId(contaB.getId()).getId());
    }

    @Test
    void deveFalharAoRemoverContaInexistenteSemAfetarOutrasContas() {
        ContaBancaria conta = criarConta();
        associarEmail(conta, "a@exemplo.com");
        servicoTransferencia.receberExterno(
                new ReceberPixExternoCommand("a@exemplo.com", new BigDecimal("25.00"), "Banco Externo")
        );

        assertThrows(RecursoNaoEncontradoException.class, () -> servicoConta.remover(UUID.randomUUID()));

        assertEquals(1, repositorioChave.listarPorContaId(conta.getId()).size());
        assertEquals(1, repositorioTransferencia.listarPorConta(conta.getId()).size());
        assertEquals("25.00", servicoConta.buscarPorId(conta.getId()).getSaldo().valor().toPlainString());
    }

    private ContaBancaria criarConta() {
        return servicoConta.cadastrar(new CadastroContaBancariaCommand(titular.getId(), "0001", null));
    }

    private void associarEmail(ContaBancaria conta, String email) {
        servicoChave.associar(new AssociarChavePixCommand(conta.getId(), TipoChavePix.EMAIL, email));
    }
}
