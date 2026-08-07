package com.g9_latam_team_67.backend.exception;

public class ClassifierUnavailableException extends RuntimeException {
    public ClassifierUnavailableException() {
        super("No fue posible conectar con el modelo de clasificación.");
    }
}
