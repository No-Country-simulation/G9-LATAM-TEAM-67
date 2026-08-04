package com.g9_latam_team_67.backend.dto.error;

import java.time.LocalDateTime;

public record ErrorResponse(

        int status,

        String message,

        LocalDateTime timestamp

) {
}