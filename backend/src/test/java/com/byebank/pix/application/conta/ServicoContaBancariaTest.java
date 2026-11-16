package com.byebank.pix.application.conta;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
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
        ContaBancaria conta = servicoConta.cadastrar(new CadastroContaBancariaCommand(
                titular.getId(), "0001", "123456"
        ));

        assertEquals(titular.getId(), conta.getUsuarioId());
        assertEquals("0.00", conta.getSaldo().valor().toPlainString());
    }

    @Test
    void deveImpedirIdentificacaoDeContaDuplicada() {
        CadastroContaBancariaCommand comando = new CadastroContaBancariaCommand(titular.getId(), "0001", "123456");
        servicoConta.cadastrar(comando);

        assertThrows(RegraDeNegocioException.class, () -> servicoConta.cadastrar(comando));
    }

    @Test
    void deveListarContasDoUsuario() {
        servicoConta.cadastrar(new CadastroContaBancariaCommand(titular.getId(), "0001", "123456"));
        servicoConta.cadastrar(new CadastroContaBancariaCommand(titular.getId(), "0001", "654321"));

        assertEquals(2, servicoConta.listarPorUsuario(titular.getId()).size());
    }

    @Test
    void deveApagarChavesPixAoRemoverConta() {
        ContaBancaria conta = criarConta("111111");
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
        ContaBancaria contaA = criarConta("111111");
        ContaBancaria contaB = criarConta("222222");
        associarEmail(contaA, "a@exemplo.com");
        associarEmail(contaB, "b@exemplo.com");
        TransferenciaPix recebimento = servicoTransferencia.receberExterno(
                new ReceberPixExternoCommand("a@exemplo.com", new BigDecimal("100.00"), "Banco Externo")
        );
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
        ContaBancaria conta = criarConta("111111");
        associarEmail(conta, "a@exemplo.com");
        servicoTransferencia.receberExterno(
                new ReceberPixExternoCommand("a@exemplo.com", new BigDecimal("25.00"), "Banco Externo")
        );

        assertThrows(RecursoNaoEncontradoException.class, () -> servicoConta.remover(UUID.randomUUID()));

        assertEquals(1, repositorioChave.listarPorContaId(conta.getId()).size());
        assertEquals(1, repositorioTransferencia.listarPorConta(conta.getId()).size());
        assertEquals("25.00", servicoConta.buscarPorId(conta.getId()).getSaldo().valor().toPlainString());
    }

    private ContaBancaria criarConta(String numero) {
        return servicoConta.cadastrar(new CadastroContaBancariaCommand(titular.getId(), "0001", numero));
    }

    private void associarEmail(ContaBancaria conta, String email) {
        servicoChave.associar(new AssociarChavePixCommand(conta.getId(), TipoChavePix.EMAIL, email));
    }
}
