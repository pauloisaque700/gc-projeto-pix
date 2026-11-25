package com.byebank.pix.api.pix;

import com.byebank.pix.application.pix.AssociarChavePixCommand;
import com.byebank.pix.application.pix.ServicoChavePix;
import com.byebank.pix.domain.pix.ChavePix;
import com.byebank.pix.domain.pix.TipoChavePix;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ChavePixController {
    private final ServicoChavePix servicoChave;

    public ChavePixController(ServicoChavePix servicoChave) {
        this.servicoChave = servicoChave;
    }

    @PostMapping("/chaves-pix")
    public ResponseEntity<ChavePixResponse> associar(@Valid @RequestBody AssociarChavePixRequest request) {
        ChavePix chave = servicoChave.associar(new AssociarChavePixCommand(
                request.contaId(), TipoChavePix.valueOf(request.tipo()), request.valor()
        ));
        ChavePixResponse resposta = ChavePixResponse.de(chave);
        URI localizacao = localizacaoDaChave(resposta.id());
        return ResponseEntity.created(localizacao).body(resposta);
    }

    @PostMapping("/chaves-pix/aleatoria")
    public ResponseEntity<ChavePixResponse> gerarAleatoria(@Valid @RequestBody GerarChaveAleatoriaRequest request) {
        ChavePix chave = servicoChave.gerarAleatoria(request.contaId());
        ChavePixResponse resposta = ChavePixResponse.de(chave);
        URI localizacao = localizacaoDaChave(resposta.id());
        return ResponseEntity.created(localizacao).body(resposta);
    }

    @PostMapping("/chaves-pix/validar")
    public ValidarChavePixResponse validar(@Valid @RequestBody ValidarChavePixRequest request) {
        return ValidarChavePixResponse.de(
                servicoChave.validar(TipoChavePix.valueOf(request.tipo()), request.valor())
        );
    }

    /** Resolve uma chave PIX digitada em uma transferência, retornando o nome do titular de destino. */
    @GetMapping("/chaves-pix/resolver")
    public ResolverChavePixResponse resolver(@RequestParam String valor) {
        return ResolverChavePixResponse.de(servicoChave.resolver(valor));
    }

    @GetMapping("/chaves-pix/{id}")
    public ChavePixResponse buscarPorId(@PathVariable UUID id) {
        return ChavePixResponse.de(servicoChave.buscarPorId(id));
    }

    @GetMapping("/contas/{contaId}/chaves-pix")
    public List<ChavePixResponse> listarPorConta(@PathVariable UUID contaId) {
        return servicoChave.listarPorConta(contaId).stream().map(ChavePixResponse::de).toList();
    }

    @DeleteMapping("/chaves-pix/{id}")
    public ResponseEntity<Void> remover(@PathVariable UUID id) {
        servicoChave.remover(id);
        return ResponseEntity.noContent().build();
    }

    private URI localizacaoDaChave(UUID id) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/chaves-pix/{id}")
                .buildAndExpand(id)
                .toUri();
    }
}
