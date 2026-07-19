package com.g9_latam_team_67.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "Debe ingresar un correo válido")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        String password
) {
}
