package com.byebank.pix.api.pix;

import com.byebank.pix.application.pix.ReceberPixExternoCommand;
import com.byebank.pix.application.pix.ServicoTransferenciaPix;
import com.byebank.pix.application.pix.TransferirPixCommand;
import com.byebank.pix.domain.pix.TransferenciaPix;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@Profile("!mysql")
@RequestMapping("/api")
public class TransferenciaPixController {
    private final ServicoTransferenciaPix servicoTransferencia;

    public TransferenciaPixController(ServicoTransferenciaPix servicoTransferencia) {
        this.servicoTransferencia = servicoTransferencia;
    }

    @PostMapping("/pix/transferencias")
    public ResponseEntity<TransferenciaPixResponse> transferir(@Valid @RequestBody TransferirPixRequest request) {
        TransferenciaPix transferencia = servicoTransferencia.transferir(new TransferirPixCommand(
                request.contaOrigemId(), request.chaveDestino(), request.valor()
        ));
        TransferenciaPixResponse resposta = TransferenciaPixResponse.de(transferencia);
        URI localizacao = localizacaoDaTransferencia(resposta.id());
        return ResponseEntity.created(localizacao).body(resposta);
    }

    @PostMapping("/pix/recebimentos-externos")
    public ResponseEntity<TransferenciaPixResponse> receberExterno(@Valid @RequestBody ReceberPixExternoRequest request) {
        TransferenciaPix transferencia = servicoTransferencia.receberExterno(new ReceberPixExternoCommand(
                request.chaveDestino(), request.valor(), request.origemExterna()
        ));
        TransferenciaPixResponse resposta = TransferenciaPixResponse.de(transferencia);
        URI localizacao = localizacaoDaTransferencia(resposta.id());
        return ResponseEntity.created(localizacao).body(resposta);
    }

    @GetMapping("/pix/transferencias/{id}")
    public TransferenciaPixResponse buscarPorId(@PathVariable UUID id) {
        return TransferenciaPixResponse.de(servicoTransferencia.buscarPorId(id));
    }

    @GetMapping("/contas/{contaId}/extrato-pix")
    public List<TransferenciaPixResponse> listarExtrato(@PathVariable UUID contaId) {
        return servicoTransferencia.listarExtrato(contaId).stream().map(TransferenciaPixResponse::de).toList();
    }

    private URI localizacaoDaTransferencia(UUID id) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/pix/transferencias/{id}")
                .buildAndExpand(id)
                .toUri();
    }
}
