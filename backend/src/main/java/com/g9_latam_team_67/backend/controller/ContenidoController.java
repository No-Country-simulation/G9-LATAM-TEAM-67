package com.g9_latam_team_67.backend.controller;

import com.g9_latam_team_67.backend.dto.contenido.*;
import com.g9_latam_team_67.backend.entity.User;
import com.g9_latam_team_67.backend.service.ClasificacionService;
import com.g9_latam_team_67.backend.service.ContenidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping({"/api/contenido"})
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
    public ResponseEntity<ContenidoResponse> clasificar(
            @Valid @RequestBody ContenidoRequest contenidoRequest,
            @AuthenticationPrincipal User userActual,
            UriComponentsBuilder uriComponentsBuilder) {
        //aqui trabajare con el @service de clasificar
        String texto = contenidoRequest.titulo()+" "+contenidoRequest.texto();
        ClasificacionApiRequest apiRequest = new ClasificacionApiRequest(texto);

        ClasificacionApiResponse apiResponse = clasificacionService.enviarTexto(apiRequest);
        ContenidoResponse respuesta = contenidoService.guardar(contenidoRequest, apiResponse, userActual);

        var uri = uriComponentsBuilder.path("/{id}").buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }
}

