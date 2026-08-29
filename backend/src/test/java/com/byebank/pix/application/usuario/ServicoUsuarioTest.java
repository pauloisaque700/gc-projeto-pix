package com.byebank.pix.application.usuario;

import com.byebank.pix.application.comum.RegraDeNegocioException;
import com.byebank.pix.domain.usuario.TipoDocumento;
import com.byebank.pix.domain.usuario.Usuario;
import com.byebank.pix.infrastructure.conta.RepositorioContaBancariaEmMemoria;
import com.byebank.pix.infrastructure.usuario.RepositorioUsuarioEmMemoria;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ServicoUsuarioTest {
    private ServicoUsuario servicoUsuario;

    @BeforeEach
    void preparar() {
        servicoUsuario = new ServicoUsuario(new RepositorioUsuarioEmMemoria(), new RepositorioContaBancariaEmMemoria());
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

    private CadastroUsuarioCommand comandoPadrao() {
        return new CadastroUsuarioCommand(
                "Maria da Silva", TipoDocumento.CPF, "529.982.247-25", "Maria@Exemplo.com", "(88) 99999-0000"
        );
    }
}
