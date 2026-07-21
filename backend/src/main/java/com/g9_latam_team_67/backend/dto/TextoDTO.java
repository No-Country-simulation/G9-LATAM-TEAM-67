package com.g9_latam_team_67.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record TextoDTO(
        @NotBlank(message = "Titulo obligatorio") String titulo,
        String texto
)  {
}
