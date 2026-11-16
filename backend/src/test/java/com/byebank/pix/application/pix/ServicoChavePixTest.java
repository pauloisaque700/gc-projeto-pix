package com.byebank.pix.application.pix;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.pix.ChavePix;
import com.byebank.pix.domain.pix.TipoChavePix;
import com.byebank.pix.domain.usuario.Documento;
import com.byebank.pix.domain.usuario.Email;
import com.byebank.pix.domain.usuario.Telefone;
import com.byebank.pix.domain.usuario.TipoDocumento;
import com.byebank.pix.domain.usuario.Usuario;
import com.byebank.pix.infrastructure.conta.RepositorioContaBancariaEmMemoria;
import com.byebank.pix.infrastructure.pix.RepositorioChavePixEmMemoria;
import com.byebank.pix.infrastructure.usuario.RepositorioUsuarioEmMemoria;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ServicoChavePixTest {
    private RepositorioChavePixEmMemoria repositorioChave;
    private ServicoChavePix servicoChave;
    private ContaBancaria conta;
    private ContaBancaria outraConta;

    @BeforeEach
    void preparar() {
        RepositorioUsuarioEmMemoria repositorioUsuario = new RepositorioUsuarioEmMemoria();
        RepositorioContaBancariaEmMemoria repositorioConta = new RepositorioContaBancariaEmMemoria();
        repositorioChave = new RepositorioChavePixEmMemoria();

        Usuario titular = Usuario.cadastrar(
                "Maria da Silva",
                Documento.criar(TipoDocumento.CPF, "529.982.247-25"),
                Email.criar("maria@exemplo.com"),
                Telefone.criar("88999990000")
        );
        repositorioUsuario.salvar(titular);
        conta = repositorioConta.salvar(ContaBancaria.criar(titular.getId(), "0001", "123456"));
        outraConta = repositorioConta.salvar(ContaBancaria.criar(titular.getId(), "0001", "654321"));

        servicoChave = new ServicoChavePix(repositorioChave, repositorioConta, repositorioUsuario);
    }

    @Test
    void deveAssociarChaveDeEmail() {
        ChavePix chave = associar(conta, TipoChavePix.EMAIL, "Maria@Exemplo.com");

        assertEquals(TipoChavePix.EMAIL, chave.getTipo());
        assertEquals("maria@exemplo.com", chave.getValor());
        assertTrue(chave.estaAssociada());
        assertEquals(conta.getId(), chave.getContaId());
    }

    @Test
    void deveAssociarChaveDeTelefone() {
        ChavePix chave = associar(conta, TipoChavePix.TELEFONE, "(88) 99999-0000");

        assertEquals(TipoChavePix.TELEFONE, chave.getTipo());
        assertEquals("88999990000", chave.getValor());
        assertTrue(chave.estaAssociada());
        assertEquals(conta.getId(), chave.getContaId());
    }

    @Test
    void deveAssociarChaveCpfDoTitular() {
        ChavePix chave = associar(conta, TipoChavePix.CPF, "529.982.247-25");

        assertEquals(TipoChavePix.CPF, chave.getTipo());
        assertEquals("52998224725", chave.getValor());
        assertTrue(chave.estaAssociada());
        assertEquals(conta.getId(), chave.getContaId());
    }

    @Test
    void deveGerarChaveAleatoria() {
        ChavePix chave = servicoChave.gerarAleatoria(conta.getId());

        assertEquals(TipoChavePix.ALEATORIA, chave.getTipo());
        assertDoesNotThrow(() -> UUID.fromString(chave.getValor()));
        assertTrue(chave.estaAssociada());
        assertEquals(conta.getId(), chave.getContaId());
    }

    @Test
    void deveValidarChaveDisponivelEDepoisIndisponivelAposAssociar() {
        ResultadoValidacaoChavePix antes = servicoChave.validar(TipoChavePix.EMAIL, "joao@exemplo.com");

        assertTrue(antes.valida());
        assertTrue(antes.disponivel());

        associar(conta, TipoChavePix.EMAIL, "joao@exemplo.com");
        ResultadoValidacaoChavePix depois = servicoChave.validar(TipoChavePix.EMAIL, "joao@exemplo.com");

        assertTrue(depois.valida());
        assertFalse(depois.disponivel());
    }

    @Test
    void deveListarChavesDaConta() {
        associar(conta, TipoChavePix.EMAIL, "um@exemplo.com");
        associar(conta, TipoChavePix.TELEFONE, "(88) 99999-0000");

        assertEquals(2, servicoChave.listarPorConta(conta.getId()).size());
        assertTrue(servicoChave.listarPorConta(outraConta.getId()).isEmpty());
    }

    @Test
    void deveRemoverChave() {
        ChavePix chave = associar(conta, TipoChavePix.EMAIL, "remover@exemplo.com");

        servicoChave.remover(chave.getId());

        assertThrows(RecursoNaoEncontradoException.class, () -> servicoChave.buscarPorId(chave.getId()));
        assertTrue(servicoChave.validar(TipoChavePix.EMAIL, "remover@exemplo.com").disponivel());
    }

    @Test
    void deveRejeitarChaveComFormatoInvalido() {
        assertThrows(RegraDeNegocioException.class,
                () -> associar(conta, TipoChavePix.CPF, "529.982.247-24"));
    }

    @Test
    void deveRejeitarCpfDeOutroTitular() {
        assertThrows(RegraDeNegocioException.class,
                () -> associar(conta, TipoChavePix.CPF, "111.444.777-35"));
    }

    @Test
    void deveRejeitarChaveJaAssociadaEmOutraConta() {
        associar(conta, TipoChavePix.EMAIL, "unica@exemplo.com");

        assertThrows(RegraDeNegocioException.class,
                () -> associar(outraConta, TipoChavePix.EMAIL, "unica@exemplo.com"));

        assertTrue(repositorioChave.existePorValor("unica@exemplo.com"));
        assertEquals(1, servicoChave.listarPorConta(conta.getId()).size());
        assertTrue(servicoChave.listarPorConta(outraConta.getId()).isEmpty());
    }

    @Test
    void deveImpedirSextaChaveNaConta() {
        for (int numero = 1; numero <= 5; numero++) {
            associar(conta, TipoChavePix.EMAIL, "chave" + numero + "@exemplo.com");
        }

        assertThrows(RegraDeNegocioException.class,
                () -> associar(conta, TipoChavePix.EMAIL, "chave6@exemplo.com"));

        assertEquals(5, servicoChave.listarPorConta(conta.getId()).size());
    }

    @Test
    void deveRejeitarValidacaoDeChaveAleatoria() {
        assertThrows(RegraDeNegocioException.class,
                () -> servicoChave.validar(TipoChavePix.ALEATORIA, "qualquer-valor"));
    }

    @Test
    void deveFalharAoBuscarChaveInexistentePorId() {
        assertThrows(RecursoNaoEncontradoException.class, () -> servicoChave.buscarPorId(UUID.randomUUID()));
    }

    private ChavePix associar(ContaBancaria contaAlvo, TipoChavePix tipo, String valor) {
        return servicoChave.associar(new AssociarChavePixCommand(contaAlvo.getId(), tipo, valor));
    }
}
