package com.g9_latam_team_67.backend.service.user;

import com.g9_latam_team_67.backend.dto.auth.RegisterRequest;
import com.g9_latam_team_67.backend.dto.auth.RegisterResponse;
import com.g9_latam_team_67.backend.dto.user.CreateUserRequest;
import com.g9_latam_team_67.backend.dto.user.UpdateUserRequest;
import com.g9_latam_team_67.backend.dto.user.UserResponse;

import java.util.List;

public interface UserService {
    RegisterResponse register(RegisterRequest request);

    List<UserResponse> findAll();

    UserResponse findById(Long id);

    UserResponse create(CreateUserRequest request);

    UserResponse update(Long id, UpdateUserRequest request);

    UserResponse deactivate(Long id);

    UserResponse activate(Long id);

    void delete(Long id);

}
