package com.g9_latam_team_67.backend.entity;

import com.g9_latam_team_67.backend.dto.TextoCategorizadoDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Texto {

    private Long id;
    private String titulo;
    private String texto;
    private String categoria;

    public Texto(TextoCategorizadoDTO textoCategorizadoDTO){
        this.id = null;
        this.titulo = textoCategorizadoDTO.titulo();
        this.texto = textoCategorizadoDTO.Texto();
        this.categoria=textoCategorizadoDTO.categoria();
    }
}
