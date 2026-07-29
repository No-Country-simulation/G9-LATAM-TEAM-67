package com.g9_latam_team_67.backend.controller;

import com.g9_latam_team_67.backend.dto.contenido.ClasificacionResponse;
import com.g9_latam_team_67.backend.dto.contenido.ContenidoRequest;
import com.g9_latam_team_67.backend.dto.contenido.ContenidoResponse;
import com.g9_latam_team_67.backend.service.ClasificacionService;
import com.g9_latam_team_67.backend.service.ContenidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/contenido", "/api/contenidos"})
public class ContenidoController {
    private final ContenidoService contenidoService;
    private final ClasificacionService clasificacionService;

    public ContenidoController(
            ContenidoService contenidoService,
            ClasificacionService clasificacionService
    ) {
        this.contenidoService = contenidoService;
        this.clasificacionService = clasificacionService;
    }
    @PostMapping
    public ResponseEntity<ContenidoResponse> crear(
            @Valid @RequestBody ContenidoRequest contenidoRequest
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(contenidoService.crearContenido(contenidoRequest));
    }

    @GetMapping
    public ResponseEntity<List<ContenidoResponse>> obtenerTodos() {
        return ResponseEntity.ok(contenidoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContenidoResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(contenidoService.obtenerPorId(id));
    }

    @PostMapping("/clasificar")
    public ResponseEntity<ClasificacionResponse> clasificar(
            @Valid @RequestBody ContenidoRequest contenidoRequest) {
        return ResponseEntity.ok(clasificacionService.clasificar(contenidoRequest));
    }
}

