package com.byebank.pix.application.conta;

import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.usuario.Documento;
import com.byebank.pix.domain.usuario.Email;
import com.byebank.pix.domain.usuario.Telefone;
import com.byebank.pix.domain.usuario.TipoDocumento;
import com.byebank.pix.domain.usuario.Usuario;
import com.byebank.pix.infrastructure.conta.RepositorioContaBancariaEmMemoria;
import com.byebank.pix.infrastructure.usuario.RepositorioUsuarioEmMemoria;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ServicoContaBancariaTest {
    private ServicoContaBancaria servicoConta;
    private Usuario titular;

    @BeforeEach
    void preparar() {
        RepositorioUsuarioEmMemoria repositorioUsuario = new RepositorioUsuarioEmMemoria();
        titular = Usuario.cadastrar(
                "Maria da Silva",
                Documento.criar(TipoDocumento.CPF, "529.982.247-25"),
                Email.criar("maria@exemplo.com"),
                Telefone.criar("88999990000")
        );
        repositorioUsuario.salvar(titular);
        servicoConta = new ServicoContaBancaria(new RepositorioContaBancariaEmMemoria(), repositorioUsuario);
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
}
