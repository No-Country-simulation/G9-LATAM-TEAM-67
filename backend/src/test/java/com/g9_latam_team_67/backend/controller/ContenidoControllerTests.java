package com.g9_latam_team_67.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ContenidoControllerTests {

    @LocalServerPort
    private int port;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Test
    void solicitudValidaDevuelveOkYClasificacionBackend() throws Exception {
        HttpResponse<String> response = enviarSolicitud("""
                {
                  "titulo": "Introducción a Spring Boot",
                  "texto": "Aprende a desarrollar APIs REST utilizando Java y Spring Boot."
                }
                """);

        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("\"categoria\":\"Backend\""));
    }

    @Test
    void tituloVacioDevuelveBadRequest() throws Exception {
        HttpResponse<String> response = enviarSolicitud("""
                {
                  "titulo": "",
                  "texto": "Contenido suficientemente largo"
                }
                """);

        assertEquals(400, response.statusCode());
    }

    @Test
    void textoMenorDeDiezCaracteresDevuelveBadRequest() throws Exception {
        HttpResponse<String> response = enviarSolicitud("""
                {
                  "titulo": "Título válido",
                  "texto": "Corto"
                }
                """);

        assertEquals(400, response.statusCode());
    }

    private HttpResponse<String> enviarSolicitud(String json) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/api/contenidos/clasificar"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
