package com.g9_latam_team_67.backend.service.auth;

import com.g9_latam_team_67.backend.dto.auth.LoginRequest;
import com.g9_latam_team_67.backend.dto.auth.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}