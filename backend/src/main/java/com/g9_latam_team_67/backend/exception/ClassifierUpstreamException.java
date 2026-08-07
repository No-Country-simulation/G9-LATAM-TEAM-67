package com.g9_latam_team_67.backend.exception;

public class ClassifierUpstreamException extends RuntimeException {
    private final int upstreamStatus;

    public ClassifierUpstreamException(int upstreamStatus) {
        super("El modelo de clasificación devolvió una respuesta no exitosa.");
        this.upstreamStatus = upstreamStatus;
    }

    public int getUpstreamStatus() {
        return upstreamStatus;
    }
}
