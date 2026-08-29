package com.byebank.pix.api.usuario;

import com.byebank.pix.application.usuario.AtualizacaoUsuarioCommand;
import com.byebank.pix.application.usuario.CadastroUsuarioCommand;
import com.byebank.pix.application.usuario.ServicoUsuario;
import com.byebank.pix.domain.usuario.TipoDocumento;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final ServicoUsuario servicoUsuario;

    public UsuarioController(ServicoUsuario servicoUsuario) {
        this.servicoUsuario = servicoUsuario;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> criar(@Valid @RequestBody CriarUsuarioRequest request) {
        UsuarioResponse resposta = UsuarioResponse.de(servicoUsuario.cadastrar(new CadastroUsuarioCommand(
                request.nomeCompleto(),
                TipoDocumento.valueOf(request.tipoDocumento()),
                request.documento(),
                request.email(),
                request.telefone()
        )));

        URI localizacao = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(resposta.id())
                .toUri();
        return ResponseEntity.created(localizacao).body(resposta);
    }

    @GetMapping("/{id}")
    public UsuarioResponse buscarPorId(@PathVariable UUID id) {
        return UsuarioResponse.de(servicoUsuario.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public UsuarioResponse atualizar(@PathVariable UUID id, @Valid @RequestBody AtualizarUsuarioRequest request) {
        return UsuarioResponse.de(servicoUsuario.atualizar(id, new AtualizacaoUsuarioCommand(
                request.nomeCompleto(),
                request.email(),
                request.telefone()
        )));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable UUID id) {
        servicoUsuario.remover(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
