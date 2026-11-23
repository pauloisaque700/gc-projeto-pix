package com.byebank.pix.application.conta;

import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.conta.CanalNotificacao;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.Dinheiro;
import com.byebank.pix.domain.conta.StatusConta;
import com.byebank.pix.domain.conta.TipoConta;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ServicoContaBancariaCamposTest {
    private ServicoContaBancaria servicoConta;
    private Usuario titular;

    @BeforeEach
    void preparar() {
        RepositorioUsuarioEmMemoria repositorioUsuario = new RepositorioUsuarioEmMemoria();
        RepositorioContaBancariaEmMemoria repositorioConta = new RepositorioContaBancariaEmMemoria();
        RepositorioChavePixEmMemoria repositorioChave = new RepositorioChavePixEmMemoria();
        RepositorioTransferenciaPixEmMemoria repositorioTransferencia = new RepositorioTransferenciaPixEmMemoria();
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
    }

    @Test
    void deveCriarContaComDefaultsCorretos() {
        ContaBancaria conta = criarConta(null);

        assertEquals(TipoConta.CORRENTE, conta.getTipoConta());
        assertEquals(StatusConta.ATIVA, conta.getStatus());
        assertEquals(new BigDecimal("1000.00"), conta.getLimiteDiario().valor());
        assertNull(conta.getNotificacao());
    }

    @Test
    void deveCriarContaComTipoPoupanca() {
        ContaBancaria conta = criarConta(TipoConta.POUPANCA);

        assertEquals(TipoConta.POUPANCA, servicoConta.buscarPorId(conta.getId()).getTipoConta());
    }

    @Test
    void deveDefinirLimiteDiario() {
        ContaBancaria conta = criarConta(null);

        servicoConta.definirLimiteDiario(conta.getId(), new BigDecimal("500.00"));

        assertEquals(new BigDecimal("500.00"), servicoConta.buscarPorId(conta.getId()).getLimiteDiario().valor());
    }

    @Test
    void deveDefinirNotificacaoPorEmail() {
        ContaBancaria conta = criarConta(null);

        servicoConta.definirNotificacao(conta.getId(), CanalNotificacao.EMAIL);

        assertEquals(CanalNotificacao.EMAIL, servicoConta.buscarPorId(conta.getId()).getNotificacao());
    }

    @Test
    void deveBloquearContaAtiva() {
        ContaBancaria conta = criarConta(null);

        servicoConta.bloquear(conta.getId());

        assertEquals(StatusConta.BLOQUEADA, servicoConta.buscarPorId(conta.getId()).getStatus());
    }

    @Test
    void deveRejeitarBloqueioDeContaJaBloqueada() {
        ContaBancaria conta = criarConta(null);
        servicoConta.bloquear(conta.getId());

        assertThrows(RegraDeNegocioException.class, () -> servicoConta.bloquear(conta.getId()));
        assertEquals(StatusConta.BLOQUEADA, servicoConta.buscarPorId(conta.getId()).getStatus());
    }

    @Test
    void deveDesbloquearContaBloqueada() {
        ContaBancaria conta = criarConta(null);
        servicoConta.bloquear(conta.getId());

        servicoConta.desbloquear(conta.getId());

        assertEquals(StatusConta.ATIVA, servicoConta.buscarPorId(conta.getId()).getStatus());
    }

    @Test
    void deveRejeitarCreditoEmContaBloqueada() {
        ContaBancaria conta = criarConta(null);
        servicoConta.bloquear(conta.getId());

        assertThrows(IllegalStateException.class, () -> conta.creditar(Dinheiro.de(new BigDecimal("100.00"))));
        assertEquals(new BigDecimal("0.00"), servicoConta.buscarPorId(conta.getId()).getSaldo().valor());
    }

    private ContaBancaria criarConta(TipoConta tipoConta) {
        return servicoConta.cadastrar(new CadastroContaBancariaCommand(
                titular.getId(), "0001", tipoConta
        ));
    }
}
