package com.byebank.pix.api.comum;

import com.byebank.pix.application.comum.RecursoNaoEncontradoException;
import com.byebank.pix.application.comum.RegraDeNegocioException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ManipuladorDeExcecoesApi {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroApi> tratarNaoEncontrado(RecursoNaoEncontradoException excecao) {
        return resposta(HttpStatus.NOT_FOUND, excecao.getMessage(), Map.of());
    }

    @ExceptionHandler({RegraDeNegocioException.class, IllegalArgumentException.class})
    public ResponseEntity<ErroApi> tratarRegraDeNegocio(RuntimeException excecao) {
        return resposta(HttpStatus.UNPROCESSABLE_CONTENT, excecao.getMessage(), Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroApi> tratarValidacao(MethodArgumentNotValidException excecao) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError erro : excecao.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(erro.getField(), erro.getDefaultMessage());
        }
        return resposta(HttpStatus.BAD_REQUEST, "Existem campos inválidos na requisição.", campos);
    }

    private ResponseEntity<ErroApi> resposta(HttpStatus status, String mensagem, Map<String, String> campos) {
        ErroApi erro = new ErroApi(Instant.now(), status.value(), status.name(), mensagem, campos);
        return ResponseEntity.status(status).body(erro);
    }
}
