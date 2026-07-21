package com.g9_latam_team_67.backend.controller;

import com.g9_latam_team_67.backend.dto.TextoDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/texto")
public class TextoController {

    @PostMapping
    public ResponseEntity registrar(@RequestBody @Valid TextoDTO texto){

        return ResponseEntity.ok(texto);
    }
}
