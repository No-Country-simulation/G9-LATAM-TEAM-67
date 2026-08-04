package com.g9_latam_team_67.backend.dto.user;

import com.g9_latam_team_67.backend.entity.Role;

import java.time.LocalDateTime;

public record UserResponse(

        Long id,

        String name,

        String email,

        Role role,

        Boolean active,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}