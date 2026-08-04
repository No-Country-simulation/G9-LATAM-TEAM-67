package com.g9_latam_team_67.backend.dto.auth;

import com.g9_latam_team_67.backend.entity.User;

public record RegisterResponse(
        Long id,

        String name,

        String email
) {
    public RegisterResponse(User user) {
        this(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }

}
