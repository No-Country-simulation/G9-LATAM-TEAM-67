package com.g9_latam_team_67.backend.dto;

import java.time.LocalDateTime;

public record ContenidoResponse(
        Long id,
        String titulo,
        String texto,
        String categoria,
        Double probabilidad,
        LocalDateTime fecha
) {
}
