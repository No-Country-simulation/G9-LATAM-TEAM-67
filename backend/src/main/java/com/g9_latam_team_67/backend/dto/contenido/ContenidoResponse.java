package com.g9_latam_team_67.backend.dto.contenido;

import com.g9_latam_team_67.backend.entity.Contenido;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ContenidoResponse(
        Long id,
        String titulo,
        String texto,
        String categoria,
        BigDecimal probabilidad,
        LocalDateTime fecha
) {
    public ContenidoResponse(Long id, String titulo, String texto, String categoria, BigDecimal probabilidad, LocalDateTime fecha) {
        this.id = id;
        this.titulo = titulo;
        this.texto = texto;
        this.categoria = categoria;
        this.probabilidad = probabilidad;
        this.fecha = fecha;
    }
}
