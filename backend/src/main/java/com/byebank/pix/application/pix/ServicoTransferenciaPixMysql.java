package com.byebank.pix.application.pix;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.domain.conta.ContaBancaria;
import com.byebank.pix.domain.conta.RepositorioContaBancaria;
import com.byebank.pix.domain.pix.RepositorioChavePix;
import com.byebank.pix.domain.pix.RepositorioTransferenciaPix;
import com.byebank.pix.domain.pix.TransferenciaPix;
import java.util.UUID;
import java.util.function.BiFunction;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("mysql")
public class ServicoTransferenciaPixMysql extends ServicoTransferenciaPix {
    private final RepositorioContaBancaria contas;
    private final RepositorioTransferenciaPix transferencias;

    public ServicoTransferenciaPixMysql(RepositorioContaBancaria contas, RepositorioChavePix chaves,
                                        RepositorioTransferenciaPix transferencias) {
        super(contas, chaves, transferencias);
        this.contas = contas;
        this.transferencias = transferencias;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransferenciaPix transferir(TransferirPixCommand comando) {
        return super.transferir(comando);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransferenciaPix receberExterno(ReceberPixExternoCommand comando) {
        return super.receberExterno(comando);
    }

    @Override
    protected TransferenciaPix movimentar(UUID origemId, UUID destinoId,
                                          BiFunction<ContaBancaria, ContaBancaria, TransferenciaPix> operacao) {
        if (origemId == null) {
            return operacao.apply(null, bloquear(destinoId));
        }
        // A ordem é a mesma para A → B e B → A. O total diário é consultado depois dos bloqueios.
        if (origemId.compareTo(destinoId) < 0) {
            return operacao.apply(bloquear(origemId), bloquear(destinoId));
        }
        ContaBancaria destino = bloquear(destinoId);
        return operacao.apply(bloquear(origemId), destino);
    }

    @Override
    protected TransferenciaPix registrar(TransferenciaPix transferencia) {
        return transferencias.salvar(transferencia);
    }

    private ContaBancaria bloquear(UUID id) {
        return contas.buscarPorIdParaAtualizar(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conta bancária não encontrada."));
    }
}
