package com.g9_latam_team_67.backend.controller;

import com.g9_latam_team_67.backend.repository.ContenidoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ContenidoControllerTests {

    private final MockMvc mockMvc;
    private final ContenidoRepository contenidoRepository;

    @Autowired
    ContenidoControllerTests(
            MockMvc mockMvc,
            ContenidoRepository contenidoRepository
    ) {
        this.mockMvc = mockMvc;
        this.contenidoRepository = contenidoRepository;
    }

    @BeforeEach
    void limpiarContenidos() {
        contenidoRepository.deleteAll();
    }

    @Test
    void postExitoso() throws Exception {
        mockMvc.perform(post("/api/contenido")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contenidoValido()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.titulo").value("Introducción a Spring Boot"))
                .andExpect(jsonPath("$.categoria").value("Backend"))
                .andExpect(jsonPath("$.probabilidad").value(0.90))
                .andExpect(jsonPath("$.fecha").exists());
    }

    @Test
    void entradaInvalidaDevuelveBadRequest() throws Exception {
        mockMvc.perform(post("/api/contenido")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo": "",
                                  "texto": "Corto"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getDevuelveLista() throws Exception {
        crearContenido();

        mockMvc.perform(get("/api/contenido"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].categoria").value("Backend"));
    }

    @Test
    void getPorIdDevuelveContenido() throws Exception {
        long id = crearContenido();

        mockMvc.perform(get("/api/contenido/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.titulo").value("Introducción a Spring Boot"));
    }

    @Test
    void getPorIdInexistenteDevuelveNotFound() throws Exception {
        mockMvc.perform(get("/api/contenido/{id}", 999999))
                .andExpect(status().isNotFound());
    }

    @Test
    void clasificacionProvisionalExistenteSigueDisponible() throws Exception {
        mockMvc.perform(post("/api/contenidos/clasificar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contenidoValido()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoria").value("Backend"));
    }

    private long crearContenido() throws Exception {
        String location = mockMvc.perform(post("/api/contenido")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contenidoValido()))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return Long.parseLong(location.replaceAll(".*\"id\":(\\d+).*", "$1"));
    }

    private String contenidoValido() {
        return """
                {
                  "titulo": "Introducción a Spring Boot",
                  "texto": "Aprende a desarrollar APIs REST utilizando Java y Spring Boot."
                }
                """;
    }
}
