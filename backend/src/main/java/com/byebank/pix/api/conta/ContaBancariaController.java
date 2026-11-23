package com.byebank.pix.api.conta;

import com.byebank.pix.application.conta.AtualizacaoContaBancariaCommand;
import com.byebank.pix.application.conta.CadastroContaBancariaCommand;
import com.byebank.pix.application.conta.ServicoContaBancaria;
import com.byebank.pix.domain.conta.CanalNotificacao;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.TipoConta;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ContaBancariaController {
    private final ServicoContaBancaria servicoConta;

    public ContaBancariaController(ServicoContaBancaria servicoConta) {
        this.servicoConta = servicoConta;
    }

    @PostMapping("/contas")
    public ResponseEntity<ContaBancariaResponse> criar(@Valid @RequestBody CriarContaBancariaRequest request) {
        ContaBancaria conta = servicoConta.cadastrar(new CadastroContaBancariaCommand(
                request.usuarioId(), request.agencia(),
                request.tipoConta() == null ? null : TipoConta.valueOf(request.tipoConta())));
        ContaBancariaResponse resposta = responder(conta);
        URI localizacao = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(resposta.id())
                .toUri();
        return ResponseEntity.created(localizacao).body(resposta);
    }

    @GetMapping("/contas/{id}")
    public ContaBancariaResponse buscarPorId(@PathVariable UUID id) {
        return responder(servicoConta.buscarPorId(id));
    }

    @GetMapping("/usuarios/{usuarioId}/contas")
    public List<ContaBancariaResponse> listarPorUsuario(@PathVariable UUID usuarioId) {
        return servicoConta.listarPorUsuario(usuarioId).stream().map(this::responder).toList();
    }

    @PutMapping("/contas/{id}")
    public ContaBancariaResponse atualizar(@PathVariable UUID id,
                                           @Valid @RequestBody AtualizarContaBancariaRequest request) {
        return responder(servicoConta.atualizar(id,
                new AtualizacaoContaBancariaCommand(request.agencia(), request.numero())));
    }

    @DeleteMapping("/contas/{id}")
    public ResponseEntity<Void> remover(@PathVariable UUID id) {
        servicoConta.remover(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/contas/{id}/limite-diario")
    public ContaBancariaResponse definirLimiteDiario(@PathVariable UUID id,
            @Valid @RequestBody DefinirLimiteDiarioRequest request) {
        return responder(servicoConta.definirLimiteDiario(id, request.limiteDiario()));
    }

    @PatchMapping("/contas/{id}/notificacao")
    public ContaBancariaResponse definirNotificacao(@PathVariable UUID id,
            @Valid @RequestBody DefinirNotificacaoRequest request) {
        return responder(servicoConta.definirNotificacao(id,
                request.canal() == null ? null : CanalNotificacao.valueOf(request.canal())));
    }

    @PatchMapping("/contas/{id}/status")
    public ContaBancariaResponse definirStatus(@PathVariable UUID id,
            @Valid @RequestBody DefinirStatusRequest request) {
        return responder("BLOQUEADA".equals(request.status())
                ? servicoConta.bloquear(id) : servicoConta.desbloquear(id));
    }

    private ContaBancariaResponse responder(ContaBancaria conta) {
        return ContaBancariaResponse.de(conta, servicoConta.obterNomeTitular(conta));
    }
}
