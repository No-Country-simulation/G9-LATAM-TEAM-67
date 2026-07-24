package com.g9_latam_team_67.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ContenidoNoEncontradoException extends RuntimeException {

    public ContenidoNoEncontradoException(Long id) {
        super("No existe contenido con id " + id);
    }
}
