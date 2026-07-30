package com.g9_latam_team_67.backend.dto.contenido;

import java.math.BigDecimal;
import java.util.List;

public record ClasificacionApiResponse(

        String category,
        BigDecimal probability
) {
}
