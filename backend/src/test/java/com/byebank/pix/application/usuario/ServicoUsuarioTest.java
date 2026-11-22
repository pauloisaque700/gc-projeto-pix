package com.byebank.pix.application.usuario;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.application.conta.CadastroContaBancariaCommand;
import com.byebank.pix.application.conta.ServicoContaBancaria;
import com.byebank.pix.application.pix.AssociarChavePixCommand;
import com.byebank.pix.application.pix.ReceberPixExternoCommand;
import com.byebank.pix.application.pix.ServicoChavePix;
import com.byebank.pix.application.pix.ServicoTransferenciaPix;
import com.byebank.pix.application.pix.TransferirPixCommand;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.pix.ChavePix;
import com.byebank.pix.domain.pix.TipoChavePix;
import com.byebank.pix.domain.pix.TransferenciaPix;
import com.byebank.pix.domain.usuario.TipoDocumento;
import com.byebank.pix.domain.usuario.Usuario;
import com.byebank.pix.infrastructure.conta.RepositorioContaBancariaEmMemoria;
import com.byebank.pix.infrastructure.pix.RepositorioChavePixEmMemoria;
import com.byebank.pix.infrastructure.pix.RepositorioTransferenciaPixEmMemoria;
import com.byebank.pix.infrastructure.usuario.RepositorioUsuarioEmMemoria;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ServicoUsuarioTest {
    private RepositorioUsuarioEmMemoria repositorioUsuario;
    private RepositorioContaBancariaEmMemoria repositorioConta;
    private RepositorioChavePixEmMemoria repositorioChave;
    private RepositorioTransferenciaPixEmMemoria repositorioTransferencia;
    private ServicoContaBancaria servicoConta;
    private ServicoChavePix servicoChave;
    private ServicoTransferenciaPix servicoTransferencia;
    private ServicoUsuario servicoUsuario;

    @BeforeEach
    void preparar() {
        repositorioUsuario = new RepositorioUsuarioEmMemoria();
        repositorioConta = new RepositorioContaBancariaEmMemoria();
        repositorioChave = new RepositorioChavePixEmMemoria();
        repositorioTransferencia = new RepositorioTransferenciaPixEmMemoria();
        servicoConta = new ServicoContaBancaria(
                repositorioConta, repositorioUsuario, repositorioChave, repositorioTransferencia
        );
        servicoChave = new ServicoChavePix(repositorioChave, repositorioConta, repositorioUsuario);
        servicoTransferencia = new ServicoTransferenciaPix(repositorioConta, repositorioChave, repositorioTransferencia);
        servicoUsuario = new ServicoUsuario(repositorioUsuario, servicoConta);
    }

    @Test
    void deveCadastrarUsuario() {
        Usuario usuario = servicoUsuario.cadastrar(comandoPadrao());

        assertEquals("Maria da Silva", usuario.getNomeCompleto());
        assertEquals("52998224725", usuario.getDocumento().valor());
        assertEquals("maria@exemplo.com", usuario.getEmail().valor());
    }

    @Test
    void deveImpedirDocumentoDuplicado() {
        servicoUsuario.cadastrar(comandoPadrao());

        assertThrows(RegraDeNegocioException.class, () -> servicoUsuario.cadastrar(comandoPadrao()));
    }

    @Test
    void deveAtualizarDadosDoUsuarioSemAlterarDocumento() {
        Usuario usuario = servicoUsuario.cadastrar(comandoPadrao());

        Usuario atualizado = servicoUsuario.atualizar(usuario.getId(), new AtualizacaoUsuarioCommand(
                "Maria de Souza", "maria.souza@exemplo.com", "(88) 99999-8888"
        ));

        assertEquals("Maria de Souza", atualizado.getNomeCompleto());
        assertEquals("maria.souza@exemplo.com", atualizado.getEmail().valor());
        assertEquals("52998224725", atualizado.getDocumento().valor());
    }

    @Test
    void deveRemoverUsuarioEmCascataComContasChavesETransferencias() {
        Usuario usuario = servicoUsuario.cadastrar(comandoPadrao());
        ContaBancaria conta1 = criarConta(usuario);
        ContaBancaria conta2 = criarConta(usuario);
        ChavePix chave1 = associarEmail(conta1, "c1@exemplo.com");
        ChavePix chave2 = associarEmail(conta2, "c2@exemplo.com");
        TransferenciaPix recebimento = receberExterno("c1@exemplo.com", "100.00");
        TransferenciaPix entreContas = transferir(conta1, "c2@exemplo.com", "40.00");

        servicoUsuario.remover(usuario.getId());

        assertThrows(RecursoNaoEncontradoException.class, () -> servicoUsuario.buscarPorId(usuario.getId()));
        assertTrue(repositorioConta.buscarPorId(conta1.getId()).isEmpty());
        assertTrue(repositorioConta.buscarPorId(conta2.getId()).isEmpty());
        assertTrue(repositorioChave.buscarPorId(chave1.getId()).isEmpty());
        assertTrue(repositorioChave.buscarPorId(chave2.getId()).isEmpty());
        assertFalse(repositorioChave.existePorValor("c1@exemplo.com"));
        assertFalse(repositorioChave.existePorValor("c2@exemplo.com"));
        assertTrue(repositorioTransferencia.buscarPorId(recebimento.getId()).isEmpty());
        assertTrue(repositorioTransferencia.buscarPorId(entreContas.getId()).isEmpty());
    }

    @Test
    void deveRemoverUsuarioSemContasNormalmente() {
        Usuario usuario = servicoUsuario.cadastrar(comandoPadrao());

        assertDoesNotThrow(() -> servicoUsuario.remover(usuario.getId()));

        assertThrows(RecursoNaoEncontradoException.class, () -> servicoUsuario.buscarPorId(usuario.getId()));
    }

    @Test
    void deveApagarTransferenciaCruzadaEManterSaldoDaContaDoOutroUsuario() {
        Usuario usuarioA = servicoUsuario.cadastrar(comandoPadrao());
        Usuario usuarioB = servicoUsuario.cadastrar(comandoOutroUsuario());
        ContaBancaria contaA1 = criarConta(usuarioA);
        ContaBancaria contaB1 = criarConta(usuarioB);
        associarEmail(contaA1, "a1@exemplo.com");
        ChavePix chaveB1 = associarEmail(contaB1, "b1@exemplo.com");
        receberExterno("a1@exemplo.com", "100.00");
        TransferenciaPix cruzada = transferir(contaA1, "b1@exemplo.com", "30.00");

        servicoUsuario.remover(usuarioA.getId());

        assertThrows(RecursoNaoEncontradoException.class, () -> servicoUsuario.buscarPorId(usuarioA.getId()));
        assertTrue(repositorioConta.buscarPorId(contaA1.getId()).isEmpty());
        assertTrue(repositorioTransferencia.buscarPorId(cruzada.getId()).isEmpty());

        ContaBancaria contaB1Preservada = servicoConta.buscarPorId(contaB1.getId());
        assertEquals("30.00", contaB1Preservada.getSaldo().valor().toPlainString());
        assertTrue(repositorioChave.buscarPorId(chaveB1.getId()).isPresent());
        assertTrue(repositorioChave.existePorValor("b1@exemplo.com"));
        assertTrue(repositorioTransferencia.listarPorConta(contaB1.getId()).isEmpty());
    }

    private ContaBancaria criarConta(Usuario usuario) {
        return servicoConta.cadastrar(new CadastroContaBancariaCommand(usuario.getId(), "0001", null));
    }

    private ChavePix associarEmail(ContaBancaria conta, String email) {
        return servicoChave.associar(new AssociarChavePixCommand(conta.getId(), TipoChavePix.EMAIL, email));
    }

    private TransferenciaPix receberExterno(String chaveDestino, String valor) {
        return servicoTransferencia.receberExterno(
                new ReceberPixExternoCommand(chaveDestino, new BigDecimal(valor), "Banco Externo")
        );
    }

    private TransferenciaPix transferir(ContaBancaria origem, String chaveDestino, String valor) {
        servicoConta.definirLimiteDiario(origem.getId(), new BigDecimal("1000.00"));
        return servicoTransferencia.transferir(
                new TransferirPixCommand(origem.getId(), chaveDestino, new BigDecimal(valor))
        );
    }

    private CadastroUsuarioCommand comandoPadrao() {
        return new CadastroUsuarioCommand(
                "Maria da Silva", TipoDocumento.CPF, "529.982.247-25", "Maria@Exemplo.com", "(88) 99999-0000"
        );
    }

    private CadastroUsuarioCommand comandoOutroUsuario() {
        return new CadastroUsuarioCommand(
                "João Souza", TipoDocumento.CPF, "111.444.777-35", "joao@exemplo.com", "(88) 98888-0000"
        );
    }
}
