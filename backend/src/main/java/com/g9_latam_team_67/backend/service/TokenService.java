package com.g9_latam_team_67.backend.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.g9_latam_team_67.backend.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

@Service
public class TokenService {

    private final String secret;
    private final long expirationMillis;

    public TokenService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationMillis
    ) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET es obligatorio y no puede estar vacío");
        }
        if (expirationMillis <= 0) {
            throw new IllegalStateException("JWT_EXPIRATION debe ser mayor que cero");
        }
        this.secret = secret;
        this.expirationMillis = expirationMillis;
    }

    public String generateToken(User user){

        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.create()
                .withIssuer("Authentication Base Java")
                .withSubject(user.getEmail())
                .withClaim("role", user.getRole().name())
                .withExpiresAt(
                        Date.from(Instant.now().plusMillis(expirationMillis))
                )
                .sign(algorithm);
    }

    public String getSubject(String token) {

        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.require(algorithm)
                .withIssuer("Authentication Base Java")
                .build()
                .verify(token)
                .getSubject();
    }


    public boolean isValid(String token) {

        try {

            Algorithm algorithm = Algorithm.HMAC256(secret);

            JWT.require(algorithm)
                    .withIssuer("Authentication Base Java")
                    .build()
                    .verify(token);

            return true;

        } catch (Exception exception) {

            return false;
        }
    }
}
