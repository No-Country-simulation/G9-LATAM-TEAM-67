package com.g9_latam_team_67.backend.dto.contenido;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

public record ClasificacionApiRequest(String texto)  {
    public ClasificacionApiRequest (String texto) {
        this.texto = texto;
    }
    public String getTexto() { return texto; }

}
