package com.g9_latam_team_67.backend.dto.user;

import com.g9_latam_team_67.backend.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(

        String name,

        @Email(message = "Correo inválido")
        String email,

        @Size(min = 3, message = "La contraseña debe tener al menos 8 caracteres")
        String password,

        Role role,

        Boolean active

) {
}