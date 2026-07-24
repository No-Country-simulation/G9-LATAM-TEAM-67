package com.g9_latam_team_67.backend.controller;

import com.g9_latam_team_67.backend.dto.auth.LoginRequest;
import com.g9_latam_team_67.backend.dto.auth.LoginResponse;
import com.g9_latam_team_67.backend.dto.auth.RegisterRequest;
import com.g9_latam_team_67.backend.dto.auth.RegisterResponse;
import com.g9_latam_team_67.backend.repository.UserRepository;
import com.g9_latam_team_67.backend.service.auth.AuthService;
import com.g9_latam_team_67.backend.service.TokenService;
import com.g9_latam_team_67.backend.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TokenService tokenService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse registerResponse(@Valid @RequestBody RegisterRequest request) {

        return userService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

}
