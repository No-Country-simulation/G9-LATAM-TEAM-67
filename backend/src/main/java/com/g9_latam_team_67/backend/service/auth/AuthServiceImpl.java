package com.g9_latam_team_67.backend.service.auth;

import com.g9_latam_team_67.backend.dto.auth.LoginRequest;
import com.g9_latam_team_67.backend.dto.auth.LoginResponse;
import com.g9_latam_team_67.backend.entity.User;
import com.g9_latam_team_67.backend.repository.UserRepository;
import com.g9_latam_team_67.backend.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TokenService tokenService;

    @Override
    public LoginResponse login(LoginRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email(),
                            request.password()
                    )
            );
        } catch (DisabledException ex) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario desactivado");
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow();

        String token = tokenService.generateToken(user);

        return new LoginResponse(
                token,
                //!Cambio
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}