package com.g9_latam_team_67.backend.service;

import com.g9_latam_team_67.backend.dto.RegisterRequest;
import com.g9_latam_team_67.backend.dto.RegisterResponse;
import com.g9_latam_team_67.backend.entity.User;

public interface UserService {
    RegisterResponse register(RegisterRequest request);
}
