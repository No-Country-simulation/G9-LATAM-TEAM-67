package com.g9_latam_team_67.backend.controller;

import com.g9_latam_team_67.backend.dto.ClasificacionResponse;
import com.g9_latam_team_67.backend.dto.ContenidoRequest;
import com.g9_latam_team_67.backend.service.ClasificacionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contenidos")
public class ContenidoController {

    private final ClasificacionService clasificacionService;

    public ContenidoController(ClasificacionService clasificacionService) {
        this.clasificacionService = clasificacionService;
    }

    @PostMapping("/clasificar")
    public ResponseEntity<ClasificacionResponse> clasificar(
            @Valid @RequestBody ContenidoRequest contenidoRequest) {
        return ResponseEntity.ok(clasificacionService.clasificar(contenidoRequest));
    }
}
