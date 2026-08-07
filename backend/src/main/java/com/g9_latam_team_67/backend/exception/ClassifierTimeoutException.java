package com.g9_latam_team_67.backend.exception;

public class ClassifierTimeoutException extends RuntimeException {
    public ClassifierTimeoutException() {
        super("El modelo de clasificación no respondió a tiempo.");
    }
}
