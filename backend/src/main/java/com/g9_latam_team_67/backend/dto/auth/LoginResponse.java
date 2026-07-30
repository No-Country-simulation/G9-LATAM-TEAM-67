package com.g9_latam_team_67.backend.dto.auth;

public record LoginResponse(
        String token,
        //!Cambio
        Long id,
        String name,
        String email,
        String role
) {
}
