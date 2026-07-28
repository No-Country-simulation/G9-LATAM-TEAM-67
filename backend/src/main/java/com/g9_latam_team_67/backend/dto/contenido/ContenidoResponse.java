package com.g9_latam_team_67.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ContenidoResponse(
        Long id,
        String titulo,
        String texto,
        String categoria,
        BigDecimal probabilidad,
        LocalDateTime fecha
) {
}
