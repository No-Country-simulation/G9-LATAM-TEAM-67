package com.g9_latam_team_67.backend.exception;

public class InvalidClassifierResponseException extends RuntimeException {
    public InvalidClassifierResponseException() {
        super("El modelo de clasificación devolvió una respuesta inválida.");
    }
}
