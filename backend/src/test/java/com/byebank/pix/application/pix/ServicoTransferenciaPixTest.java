package com.byebank.pix.application.pix;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.Dinheiro;
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
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ServicoTransferenciaPixTest {
    private static final String CHAVE_ORIGEM = "origem@exemplo.com";
    private static final String CHAVE_DESTINO = "destino@exemplo.com";

    private RepositorioContaBancariaEmMemoria repositorioConta;
    private ServicoTransferenciaPix servicoTransferencia;
    private ContaBancaria contaOrigem;
    private ContaBancaria contaDestino;

    @BeforeEach
    void preparar() {
        RepositorioUsuarioEmMemoria repositorioUsuario = new RepositorioUsuarioEmMemoria();
        repositorioConta = new RepositorioContaBancariaEmMemoria();
        RepositorioChavePixEmMemoria repositorioChave = new RepositorioChavePixEmMemoria();
        RepositorioTransferenciaPixEmMemoria repositorioTransferencia = new RepositorioTransferenciaPixEmMemoria();

        Usuario titularOrigem = Usuario.cadastrar(
                "Maria da Silva",
                Documento.criar(TipoDocumento.CPF, "529.982.247-25"),
                Email.criar("maria@exemplo.com"),
                Telefone.criar("88999990000")
        );
        Usuario titularDestino = Usuario.cadastrar(
                "João Souza",
                Documento.criar(TipoDocumento.CPF, "111.444.777-35"),
                Email.criar("joao@exemplo.com"),
                Telefone.criar("88988880000")
        );
        repositorioUsuario.salvar(titularOrigem);
        repositorioUsuario.salvar(titularDestino);
        contaOrigem = repositorioConta.salvar(ContaBancaria.criar(titularOrigem.getId(), "0001", "123456"));
        contaDestino = repositorioConta.salvar(ContaBancaria.criar(titularDestino.getId(), "0001", "654321"));
        contaOrigem.definirLimiteDiario(Dinheiro.de(new BigDecimal("1000.00")));

        ServicoChavePix servicoChave = new ServicoChavePix(repositorioChave, repositorioConta, repositorioUsuario);
        servicoChave.associar(new AssociarChavePixCommand(contaOrigem.getId(), TipoChavePix.EMAIL, CHAVE_ORIGEM));
        servicoChave.associar(new AssociarChavePixCommand(contaDestino.getId(), TipoChavePix.EMAIL, CHAVE_DESTINO));

        servicoTransferencia = new ServicoTransferenciaPix(repositorioConta, repositorioChave, repositorioTransferencia);
    }

    @Test
    void deveReceberPixExternoCreditandoConta() {
        TransferenciaPix transferencia = servicoTransferencia.receberExterno(
                new ReceberPixExternoCommand(CHAVE_DESTINO, new BigDecimal("50.00"), "Banco Externo")
        );

        assertEquals("50.00", saldoDe(contaDestino));
        assertTrue(transferencia.ehRecebimentoExterno());
        assertNull(transferencia.getContaOrigemId());
        assertNotNull(transferencia.getOrigemExterna());
        assertEquals("Banco Externo", transferencia.getOrigemExterna());
        assertEquals(contaDestino.getId(), transferencia.getContaDestinoId());
    }

    @Test
    void deveTransferirEntreContasAtualizandoSaldos() {
        fundearOrigem("100.00");

        TransferenciaPix transferencia = transferir(CHAVE_DESTINO, "30.00");

        assertEquals("70.00", saldoDe(contaOrigem));
        assertEquals("30.00", saldoDe(contaDestino));
        assertFalse(transferencia.ehRecebimentoExterno());
        assertEquals(contaOrigem.getId(), transferencia.getContaOrigemId());
        assertEquals(contaDestino.getId(), transferencia.getContaDestinoId());
        assertEquals(CHAVE_DESTINO, transferencia.getChaveDestinoUtilizada());
    }

    @Test
    void deveRejeitarTransferenciaParaAPropriaConta() {
        fundearOrigem("100.00");

        assertThrows(RegraDeNegocioException.class, () -> transferir(CHAVE_ORIGEM, "10.00"));

        assertEquals("100.00", saldoDe(contaOrigem));
    }

    @Test
    void deveRejeitarSaldoInsuficiente() {
        fundearOrigem("20.00");

        assertThrows(RegraDeNegocioException.class, () -> transferir(CHAVE_DESTINO, "30.00"));

        assertEquals("20.00", saldoDe(contaOrigem));
        assertEquals("0.00", saldoDe(contaDestino));
        assertEquals(1, servicoTransferencia.listarExtrato(contaOrigem.getId()).size());
        assertTrue(servicoTransferencia.listarExtrato(contaDestino.getId()).isEmpty());
    }

    @Test
    void deveFalharQuandoChaveDestinoNaoExiste() {
        fundearOrigem("100.00");

        assertThrows(RecursoNaoEncontradoException.class, () -> transferir("naoexiste@exemplo.com", "10.00"));
    }

    @Test
    void deveRejeitarValorZero() {
        fundearOrigem("100.00");

        assertThrows(RegraDeNegocioException.class, () -> transferir(CHAVE_DESTINO, "0.00"));

        assertEquals("100.00", saldoDe(contaOrigem));
        assertEquals("0.00", saldoDe(contaDestino));
    }

    @Test
    void deveRejeitarTransferenciaQueExcedeLimiteDiarioAcumulado() {
        contaOrigem.definirLimiteDiario(Dinheiro.de(new BigDecimal("100.00")));
        fundearOrigem("110.00");
        transferir(CHAVE_DESTINO, "60.00");

        assertThrows(RegraDeNegocioException.class, () -> transferir(CHAVE_DESTINO, "50.00"));

        assertEquals("50.00", saldoDe(contaOrigem));
        assertEquals(1, servicoTransferencia.listarExtrato(contaOrigem.getId()).stream()
                .filter(transferencia -> contaOrigem.getId().equals(transferencia.getContaOrigemId()))
                .count());
    }

    @Test
    void deveListarExtratoDaContaSemDependerDeOrdem() {
        TransferenciaPix recebimento = fundearOrigem("100.00");
        TransferenciaPix enviada = transferir(CHAVE_DESTINO, "30.00");

        List<UUID> idsOrigem = servicoTransferencia.listarExtrato(contaOrigem.getId()).stream()
                .map(TransferenciaPix::getId)
                .toList();
        List<UUID> idsDestino = servicoTransferencia.listarExtrato(contaDestino.getId()).stream()
                .map(TransferenciaPix::getId)
                .toList();

        assertEquals(2, idsOrigem.size());
        assertTrue(idsOrigem.contains(recebimento.getId()));
        assertTrue(idsOrigem.contains(enviada.getId()));
        assertEquals(1, idsDestino.size());
        assertTrue(idsDestino.contains(enviada.getId()));
    }

    private TransferenciaPix fundearOrigem(String valor) {
        return servicoTransferencia.receberExterno(
                new ReceberPixExternoCommand(CHAVE_ORIGEM, new BigDecimal(valor), "Banco Externo")
        );
    }

    private TransferenciaPix transferir(String chaveDestino, String valor) {
        return servicoTransferencia.transferir(
                new TransferirPixCommand(contaOrigem.getId(), chaveDestino, new BigDecimal(valor))
        );
    }

    private String saldoDe(ContaBancaria conta) {
        return repositorioConta.buscarPorId(conta.getId()).orElseThrow().getSaldo().valor().toPlainString();
    }
}
