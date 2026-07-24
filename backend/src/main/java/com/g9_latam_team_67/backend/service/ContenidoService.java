package com.g9_latam_team_67.backend.service;

import com.g9_latam_team_67.backend.dto.ContenidoRequest;
import com.g9_latam_team_67.backend.dto.ContenidoResponse;
import com.g9_latam_team_67.backend.entity.Contenido;
import com.g9_latam_team_67.backend.exception.ContenidoNoEncontradoException;
import com.g9_latam_team_67.backend.repository.ContenidoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContenidoService {

    private static final String CATEGORIA_SIMULADA = "Backend";
    private static final double PROBABILIDAD_SIMULADA = 0.90;

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
                PROBABILIDAD_SIMULADA,
                null
        );

        return convertirRespuesta(contenidoRepository.save(contenido));
    }

    @Transactional(readOnly = true)
    public List<ContenidoResponse> obtenerTodos() {
        return contenidoRepository.findAll()
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    @Transactional(readOnly = true)
    public ContenidoResponse obtenerPorId(Long id) {
        return contenidoRepository.findById(id)
                .map(this::convertirRespuesta)
                .orElseThrow(() -> new ContenidoNoEncontradoException(id));
    }

    private ContenidoResponse convertirRespuesta(Contenido contenido) {
        return new ContenidoResponse(
                contenido.getId(),
                contenido.getTitulo(),
                contenido.getTexto(),
                contenido.getCategoria(),
                contenido.getProbabilidad(),
                contenido.getFecha()
        );
    }
}
