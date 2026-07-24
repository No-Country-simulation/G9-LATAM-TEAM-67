package com.g9_latam_team_67.backend.dto.user;

import com.g9_latam_team_67.backend.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(

        @NotBlank(message = "El nombre es obligatorio")
        String name,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "Correo inválido")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 3, message = "La contraseña debe tener al menos 3 caracteres")
        String password,

        @NotNull(message = "El rol es obligatorio")
        Role role

) {
}