package com.g9_latam_team_67.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import com.g9_latam_team_67.backend.filter.JwtAuthenticationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                // Permitir que H2 se muestre dentro de un frame.
                .headers(headers ->
                        headers.frameOptions(frame -> frame.sameOrigin())
                )
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(HttpMethod.POST, "/auth/register").permitAll()
                            .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                            //Documentación de  swagger en mi proyecto: http://localhost:8080/swagger-ui/index.html
                            .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                            .requestMatchers("/h2-console/**").permitAll()
                            .requestMatchers(HttpMethod.POST,"/api/contenido/clasificar")
                            .permitAll()
                            // ===== PERMISOS POR ROLES =====
                            .requestMatchers("/users/**")
                            .hasAnyRole("ADMIN", "USER")

                            .requestMatchers("/api/contenido/**")
                            .hasAnyRole("USER", "ADMIN")
                            .requestMatchers("/test/admin/**")
                            .hasRole("ADMIN")
                            .requestMatchers("/test/user/**")
                            .hasAnyRole("USER", "ADMIN")
                            .anyRequest().authenticated();
                })
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }
}
