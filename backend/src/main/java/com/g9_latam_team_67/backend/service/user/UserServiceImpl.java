package com.g9_latam_team_67.backend.service.user;

import com.g9_latam_team_67.backend.dto.auth.RegisterRequest;
import com.g9_latam_team_67.backend.dto.auth.RegisterResponse;
import com.g9_latam_team_67.backend.dto.user.CreateUserRequest;
import com.g9_latam_team_67.backend.dto.user.UpdateUserRequest;
import com.g9_latam_team_67.backend.dto.user.UserResponse;
import com.g9_latam_team_67.backend.entity.Role;
import com.g9_latam_team_67.backend.entity.User;
import com.g9_latam_team_67.backend.exception.ResourceAlreadyExistsException;
import com.g9_latam_team_67.backend.exception.ResourceNotFoundException;
import com.g9_latam_team_67.backend.mapper.UserMapper;
import com.g9_latam_team_67.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new ResourceAlreadyExistsException(
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

        User savedUser = userRepository.save(user); //Mapeamos

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );
    }

    @Override
    public List<UserResponse> findAll() {
        List<User> users = userRepository.findAll();
        return userMapper.toResponseList(users);
    }

    @Override
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuario no encontrado con id: " + id
                        )
                );

        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse create(CreateUserRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new ResourceAlreadyExistsException(
                    "El correo ya se encuentra registrado"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        User savedUser = userRepository.save(user);

        return userMapper.toResponse(savedUser);
    }

    @Override
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario no encontrado con id: " + id)
                );

        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new ResourceAlreadyExistsException("El correo ya se encuentra registrado");
            }
            user.setEmail(request.email());
        }

        if (request.name() != null) {
            user.setName(request.name());
        }

        if (request.password() != null) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        if (request.role() != null) {
            user.setRole(request.role());
        }

        if (request.active() != null) {
            user.setActive(request.active());
        }

        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    @Override
    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario no encontrado con id: " + id)
                );
        userRepository.delete(user);
    }

    public UserResponse deactivate(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario no encontrado con id: " + id)
                );
        user.setActive(false);
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    @Override
    public UserResponse activate(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario no encontrado con id: " + id)
                );
        user.setActive(true);
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }


}
