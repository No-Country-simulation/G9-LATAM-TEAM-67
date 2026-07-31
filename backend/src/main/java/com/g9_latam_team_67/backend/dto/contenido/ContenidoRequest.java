package com.g9_latam_team_67.backend.dto.contenido;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContenidoRequest(
        @NotBlank @Size(max = 150) String titulo,
        @NotBlank @Size(min = 10, max = 10000) String texto
) {
}
