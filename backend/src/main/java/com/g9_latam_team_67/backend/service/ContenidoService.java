package com.g9_latam_team_67.backend.service;

import com.g9_latam_team_67.backend.dto.contenido.ClasificacionApiResponse;
import com.g9_latam_team_67.backend.dto.contenido.ContenidoRequest;
import com.g9_latam_team_67.backend.dto.contenido.ContenidoResponse;
import com.g9_latam_team_67.backend.entity.Contenido;
import com.g9_latam_team_67.backend.entity.User;
import com.g9_latam_team_67.backend.exception.ContenidoNoEncontradoException;
import com.g9_latam_team_67.backend.repository.ContenidoRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ContenidoService {
    private static final String CATEGORIA_SIMULADA = "Backend";

    // CAMBIO: "double" -> "BigDecimal". El constructor de Contenido fue
    // actualizado para recibir BigDecimal (porque la columna en Oracle es
    // NUMBER(5,4), no FLOAT), así que este valor debe coincidir en tipo.
    // Se usa new BigDecimal("0.90") en vez de BigDecimal.valueOf(0.90)
    // para evitar imprecisiones de punto flotante en la conversión.
    private static final BigDecimal PROBABILIDAD_SIMULADA = new BigDecimal("0.90");

    private final ContenidoRepository contenidoRepository;

    public ContenidoService(ContenidoRepository contenidoRepository) {
        this.contenidoRepository = contenidoRepository;
    }
    @Transactional
    public ContenidoResponse crearContenido(ContenidoRequest request) {
        Contenido contenido = new Contenido(
                request.titulo(),
                request.texto(),
                CATEGORIA_SIMULADA,
                PROBABILIDAD_SIMULADA, // ahora es BigDecimal, coincide con el constructor
                null
        );

        return convertirRespuesta(contenidoRepository.save(contenido));
    }
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ContenidoResponse> obtenerTodos() {
        return contenidoRepository.findAll()
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ContenidoResponse obtenerPorId(Long id) {
        return contenidoRepository.findById(id)
                .map(this::convertirRespuesta)
                .orElseThrow(() -> new ContenidoNoEncontradoException(id));
    }

    private ContenidoResponse convertirRespuesta(Contenido contenido) {
        // NOTA: contenido.getProbabilidad() ahora retorna BigDecimal.
        // Si ContenidoResponse todavía tiene el campo como "Double probabilidad",
        // esta línea dará error de compilación. Necesito ver ese DTO para confirmarlo.
        return new ContenidoResponse(
                contenido.getId(),
                contenido.getTitulo(),
                contenido.getTexto(),
                contenido.getCategoria(),
                contenido.getProbabilidad(),
                contenido.getFecha()
        );
    }

    @Transactional
    public ContenidoResponse guardar(ContenidoRequest request, ClasificacionApiResponse response, User userActual){
        if (userActual == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Se requiere un usuario autenticado");
        }
        if (!Boolean.TRUE.equals(userActual.getActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El usuario autenticado está inactivo");
        }

        Contenido contenido = new Contenido(request.titulo(), request.texto(), response.category(), response.probability(), userActual);
        return convertirRespuesta(contenidoRepository.save(contenido));
    }

}
