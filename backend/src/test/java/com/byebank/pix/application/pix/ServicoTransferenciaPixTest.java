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
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.spy;

class ServicoTransferenciaPixTest {
    private static final String CHAVE_ORIGEM = "origem@exemplo.com";
    private static final String CHAVE_DESTINO = "destino@exemplo.com";

    private RepositorioContaBancariaEmMemoria repositorioConta;
    private RepositorioChavePixEmMemoria repositorioChave;
    private RepositorioTransferenciaPixEmMemoria repositorioTransferencia;
    private ServicoTransferenciaPix servicoTransferencia;
    private ContaBancaria contaOrigem;
    private ContaBancaria contaDestino;

    @BeforeEach
    void preparar() {
        RepositorioUsuarioEmMemoria repositorioUsuario = new RepositorioUsuarioEmMemoria();
        repositorioConta = new RepositorioContaBancariaEmMemoria();
        repositorioChave = new RepositorioChavePixEmMemoria();
        repositorioTransferencia = new RepositorioTransferenciaPixEmMemoria();

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
        assertEquals(List.of(transferencia), servicoTransferencia.listarExtrato(contaDestino.getId()));
        assertEquals(1, servicoTransferencia.listarExtrato(contaOrigem.getId()).stream()
                .filter(item -> !item.ehRecebimentoExterno()).count());
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
        var antes = estadoDasContas();

        assertThrows(RegraDeNegocioException.class, () -> transferir(CHAVE_DESTINO, "30.00"));

        assertEquals(antes, estadoDasContas());
    }

    @Test
    void deveFalharQuandoChaveDestinoNaoExiste() {
        fundearOrigem("100.00");
        var antes = estadoDasContas();

        assertThrows(RecursoNaoEncontradoException.class, () -> transferir("naoexiste@exemplo.com", "10.00"));

        assertEquals(antes, estadoDasContas());
    }

    @Test
    void devePreservarAsContasQuandoUmaDelasNaoExiste() {
        fundearOrigem("100.00");
        var antes = estadoDasContas();
        var comando = new TransferirPixCommand(UUID.randomUUID(), CHAVE_DESTINO, new BigDecimal("10.00"));
        assertThrows(RecursoNaoEncontradoException.class, () -> servicoTransferencia.transferir(comando));
        assertEquals(antes, estadoDasContas());

        repositorioConta.remover(contaDestino);
        assertThrows(RecursoNaoEncontradoException.class, () -> transferir(CHAVE_DESTINO, "10.00"));
        assertEquals(antes, estadoDasContas());
        assertTrue(repositorioConta.buscarPorId(contaDestino.getId()).isEmpty());
    }

    @Test
    void deveRejeitarValorZero() {
        fundearOrigem("100.00");
        var antes = estadoDasContas();

        assertThrows(RegraDeNegocioException.class, () -> transferir(CHAVE_DESTINO, "0.00"));

        assertEquals(antes, estadoDasContas());
    }

    @Test
    void deveRejeitarTransferenciaQueExcedeLimiteDiarioAcumulado() {
        contaOrigem.definirLimiteDiario(Dinheiro.de(new BigDecimal("100.00")));
        fundearOrigem("110.00");
        transferir(CHAVE_DESTINO, "60.00");
        var antes = estadoDasContas();

        assertThrows(RegraDeNegocioException.class, () -> transferir(CHAVE_DESTINO, "50.00"));

        assertEquals(antes, estadoDasContas());
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

    @Test
    void devePreservarSaldosEExtratosComOrigemBloqueada() {
        fundearOrigem("100.00");
        contaOrigem.bloquear();
        var antes = estadoDasContas();

        assertThrows(IllegalStateException.class, () -> transferir(CHAVE_DESTINO, "10.00"));

        assertEquals(antes, estadoDasContas());
    }

    @Test
    void devePreservarSaldosEExtratosComDestinoBloqueado() {
        fundearOrigem("100.00");
        contaDestino.bloquear();
        var antes = estadoDasContas();

        assertThrows(IllegalStateException.class, () -> transferir(CHAVE_DESTINO, "10.00"));

        assertEquals(antes, estadoDasContas());
    }

    @Test
    void deveRestaurarEstadoQuandoDebitoFalhaAposAlterarSaldo() {
        fundearOrigem("100.00");
        contaOrigem = repositorioConta.salvar(spy(contaOrigem));
        var falha = new IllegalStateException("Falha no débito");
        doAnswer(invocacao -> {
            invocacao.callRealMethod();
            throw falha;
        }).when(contaOrigem).debitar(any(Dinheiro.class));
        var antes = estadoDasContas();

        assertSame(falha, assertThrows(IllegalStateException.class, () -> transferir(CHAVE_DESTINO, "10.00")));
        assertEquals(antes, estadoDasContas());
    }

    @Test
    void deveRestaurarEstadoQuandoCreditoFalhaAposAlterarSaldo() {
        fundearOrigem("100.00");
        contaDestino = repositorioConta.salvar(spy(contaDestino));
        var falha = new IllegalStateException("Falha no crédito");
        doAnswer(invocacao -> {
            invocacao.callRealMethod();
            throw falha;
        }).when(contaDestino).creditar(any(Dinheiro.class));
        var antes = estadoDasContas();

        assertSame(falha, assertThrows(IllegalStateException.class, () -> transferir(CHAVE_DESTINO, "10.00")));
        assertEquals(antes, estadoDasContas());
    }

    @Test
    void deveRestaurarEstadoQuandoSalvamentoDaContaFalha() {
        fundearOrigem("100.00");
        repositorioConta = spy(repositorioConta);
        var falha = new IllegalStateException("Falha ao salvar conta");
        doAnswer(invocacao -> {
            invocacao.callRealMethod();
            throw falha;
        }).when(repositorioConta).salvar(contaDestino);
        servicoTransferencia = new ServicoTransferenciaPix(repositorioConta, repositorioChave, repositorioTransferencia);
        var antes = estadoDasContas();

        assertSame(falha, assertThrows(IllegalStateException.class, () -> transferir(CHAVE_DESTINO, "10.00")));
        assertEquals(antes, estadoDasContas());
    }

    @Test
    void deveRemoverRegistroParcialERestaurarSaldosMesmoComFalhaInesperada() {
        fundearOrigem("100.00");
        var falha = new AssertionError("Falha após inserir a transferência");
        injetarFalhaDepoisDeRegistrar(falha);
        var antes = estadoDasContas();

        assertSame(falha, assertThrows(AssertionError.class, () -> transferir(CHAVE_DESTINO, "10.00")));
        assertEquals(antes, estadoDasContas());
    }

    @Test
    void deveReverterRecebimentoExternoQuandoRegistroFalha() {
        var falha = new IllegalStateException("Falha no registro externo");
        injetarFalhaDepoisDeRegistrar(falha);
        var antes = estadoDasContas();

        assertSame(falha, assertThrows(IllegalStateException.class, () -> servicoTransferencia.receberExterno(
                new ReceberPixExternoCommand(CHAVE_DESTINO, new BigDecimal("10.00"), null))));
        assertEquals(antes, estadoDasContas());
    }

    @Test
    void deveImpedirQueEnviosConcorrentesConsumamOMesmoSaldo() throws Exception {
        fundearOrigem("100.00");

        conferirApenasUmEnvioConcorrente("Saldo insuficiente para realizar a transferência.");

        assertEquals("30.00", saldoDe(contaOrigem));
    }

    @Test
    void deveImpedirQueEnviosConcorrentesExcedamOLimite() throws Exception {
        fundearOrigem("200.00");
        contaOrigem.definirLimiteDiario(Dinheiro.de(new BigDecimal("100.00")));

        conferirApenasUmEnvioConcorrente("Limite diário de transferência excedido.");

        assertEquals("130.00", saldoDe(contaOrigem));
    }

    @Test
    void deveConcluirEnviosEmSentidosOpostosSemBloqueioMutuo() throws Exception {
        fundearOrigem("100.00");
        contaDestino.creditar(Dinheiro.de(new BigDecimal("100.00")));

        List<TransferenciaPix> enviadas = executarJuntas(
                () -> transferir(CHAVE_DESTINO, "30.00"),
                () -> servicoTransferencia.transferir(new TransferirPixCommand(
                        contaDestino.getId(), CHAVE_ORIGEM, new BigDecimal("15.00"))));

        assertEquals("85.00", saldoDe(contaOrigem));
        assertEquals("115.00", saldoDe(contaDestino));
        var extratoDestino = servicoTransferencia.listarExtrato(contaDestino.getId());
        assertEquals(2, extratoDestino.size());
        assertTrue(extratoDestino.containsAll(enviadas));
    }

    @Test
    void deveAcumularCreditoExternoEInternoConcorrentesNoDestino() throws Exception {
        fundearOrigem("100.00");

        List<TransferenciaPix> creditadas = executarJuntas(
                () -> transferir(CHAVE_DESTINO, "30.00"),
                () -> servicoTransferencia.receberExterno(new ReceberPixExternoCommand(
                        CHAVE_DESTINO, new BigDecimal("40.00"), null)));

        assertEquals("70.00", saldoDe(contaOrigem));
        assertEquals("70.00", saldoDe(contaDestino));
        var extratoDestino = servicoTransferencia.listarExtrato(contaDestino.getId());
        assertEquals(2, extratoDestino.size());
        assertTrue(extratoDestino.containsAll(creditadas));
    }

    private void injetarFalhaDepoisDeRegistrar(Throwable falha) {
        repositorioTransferencia = spy(repositorioTransferencia);
        doAnswer(invocacao -> {
            invocacao.callRealMethod();
            throw falha;
        }).when(repositorioTransferencia).salvar(any(TransferenciaPix.class));
        servicoTransferencia = new ServicoTransferenciaPix(repositorioConta, repositorioChave, repositorioTransferencia);
    }

    private void conferirApenasUmEnvioConcorrente(String mensagem) throws Exception {
        Callable<Boolean> envio = () -> {
            try {
                transferir(CHAVE_DESTINO, "70.00");
                return true;
            } catch (RegraDeNegocioException falha) {
                assertEquals(mensagem, falha.getMessage());
                return false;
            }
        };
        assertEquals(1, executarJuntas(envio, envio).stream().filter(Boolean::booleanValue).count());
        assertEquals("70.00", saldoDe(contaDestino));
        assertEquals(1, servicoTransferencia.listarExtrato(contaDestino.getId()).size());
    }

    private static <T> List<T> executarJuntas(Callable<T> primeira, Callable<T> segunda) throws Exception {
        var prontas = new CountDownLatch(2);
        var largada = new CountDownLatch(1);
        var executor = Executors.newFixedThreadPool(2, Thread.ofPlatform().daemon().factory());
        try {
            var resultados = List.of(primeira, segunda).stream().map(operacao -> executor.submit(() -> {
                prontas.countDown();
                assertTrue(largada.await(5, TimeUnit.SECONDS));
                return operacao.call();
            })).toList();
            assertTrue(prontas.await(5, TimeUnit.SECONDS));
            largada.countDown();
            return List.of(resultados.get(0).get(5, TimeUnit.SECONDS), resultados.get(1).get(5, TimeUnit.SECONDS));
        } finally {
            executor.shutdownNow();
        }
    }

    private record EstadoFinanceiro(Dinheiro saldo, Instant atualizadaEm, List<TransferenciaPix> registros) {}

    private List<EstadoFinanceiro> estadoDasContas() {
        return List.of(estadoDe(contaOrigem), estadoDe(contaDestino));
    }

    private EstadoFinanceiro estadoDe(ContaBancaria conta) {
        return new EstadoFinanceiro(conta.getSaldo(), conta.getAtualizadaEm(),
                repositorioTransferencia.listarPorConta(conta.getId()));
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
