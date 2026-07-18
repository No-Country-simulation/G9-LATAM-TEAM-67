package com.g9_latam_team_67.backend.service;

import com.g9_latam_team_67.backend.dto.RegisterRequest;
import com.g9_latam_team_67.backend.dto.RegisterResponse;
import com.g9_latam_team_67.backend.entity.Role;
import com.g9_latam_team_67.backend.entity.User;
import com.g9_latam_team_67.backend.exception.EmailAlreadyExistsException;
import com.g9_latam_team_67.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService{
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {

            throw new EmailAlreadyExistsException(
                    "El correo ya se encuentra registrado"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(
                        passwordEncoder.encode(
                                request.password()
                        )
                )
                .role(Role.USER)
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        User savedUser =  userRepository.save(user); //Mapeamos

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );
    }


}
