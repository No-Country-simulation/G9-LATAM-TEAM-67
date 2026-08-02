package com.g9_latam_team_67.backend.exception;

public class ClassifierUpstreamException extends RuntimeException {
    public ClassifierUpstreamException() {
        super("El modelo de clasificación devolvió una respuesta no exitosa.");
    }
}
