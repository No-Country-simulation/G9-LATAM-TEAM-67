package com.g9_latam_team_67.backend.service;

import com.g9_latam_team_67.backend.dto.contenido.ClasificacionResponse;
import com.g9_latam_team_67.backend.dto.contenido.ContenidoRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClasificacionService {
    public ClasificacionResponse clasificar(ContenidoRequest contenido) {
        // Esta respuesta provisional será reemplazada por la integración con el modelo de Ciencia de Datos.
        return new ClasificacionResponse(
                "Backend",
                0.95,
                List.of("Java", "Spring Boot", "API REST")
        );
    }
}
