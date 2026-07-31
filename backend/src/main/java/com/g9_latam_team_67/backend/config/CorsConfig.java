package com.g9_latam_team_67.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/**")

                // ===== CAMBIO: Puerto de Vite =====
                .allowedOrigins("http://localhost:5173")

                // ===== CAMBIO: Permitimos también OPTIONS =====
                .allowedMethods(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )

                // ===== NUEVO =====
                .allowedHeaders("*")

                // ===== NUEVO =====
                .allowCredentials(true);
    }
}
