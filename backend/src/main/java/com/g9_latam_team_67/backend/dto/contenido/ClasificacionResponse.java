package com.g9_latam_team_67.backend.dto;

import java.util.List;

public record ClasificacionResponse(
        String categoria,
        double probabilidad,
        List<String> palabrasClave
) {
}
