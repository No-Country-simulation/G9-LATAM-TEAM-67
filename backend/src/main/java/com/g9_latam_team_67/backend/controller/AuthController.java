package com.g9_latam_team_67.backend.controller;

import com.g9_latam_team_67.backend.dto.LoginRequest;
import com.g9_latam_team_67.backend.dto.LoginResponse;
import com.g9_latam_team_67.backend.dto.RegisterRequest;
import com.g9_latam_team_67.backend.dto.RegisterResponse;
import com.g9_latam_team_67.backend.entity.User;
import com.g9_latam_team_67.backend.repository.UserRepository;
import com.g9_latam_team_67.backend.service.TokenService;
import com.g9_latam_team_67.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TokenService tokenService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse registerResponse(@Valid @RequestBody RegisterRequest request){

        return userService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody @Valid LoginRequest request
    ) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow();

        String token = tokenService.generateToken(user);

        return ResponseEntity.ok(
                new LoginResponse(token)
        );
    }

}
