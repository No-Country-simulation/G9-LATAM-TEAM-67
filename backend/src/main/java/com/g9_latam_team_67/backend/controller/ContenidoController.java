package com.g9_latam_team_67.backend.controller;

import com.g9_latam_team_67.backend.dto.contenido.*;
import com.g9_latam_team_67.backend.entity.Contenido;
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
import java.util.stream.Collector;

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

    @GetMapping("/categorias")
    public ResponseEntity<Categoria> obtenerCategorias(){
        return ResponseEntity.ok(contenidoService.obtenerCategorias());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ContenidoResponse>> buscarPorCategoria(
            @RequestParam(required = false) String categoria,
            @AuthenticationPrincipal User user){
        if (categoria != null && !categoria.isEmpty()){
            List<Contenido> resultado = contenidoService.buscarPorCategoria(categoria, user);

            if (resultado.isEmpty()){
                return ResponseEntity.notFound().build();
            }else {
                List<ContenidoResponse> resultadoList = resultado
                        .stream()
                        .map(r-> new ContenidoResponse(r.getId(), r.getTitulo(), r.getTexto(), r.getCategoria(), r.getProbabilidad(), r.getFecha()))
                        .toList();

                return ResponseEntity.ok(resultadoList);
            }
        }else {
            return ResponseEntity.badRequest().build();
        }

    }

}

