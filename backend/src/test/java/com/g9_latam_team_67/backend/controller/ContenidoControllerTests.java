package com.g9_latam_team_67.backend.controller;

import com.g9_latam_team_67.backend.dto.contenido.ClasificacionApiRequest;
import com.g9_latam_team_67.backend.dto.contenido.ClasificacionApiResponse;
import com.g9_latam_team_67.backend.entity.Contenido;
import com.g9_latam_team_67.backend.entity.Role;
import com.g9_latam_team_67.backend.entity.User;
import com.g9_latam_team_67.backend.repository.ContenidoRepository;
import com.g9_latam_team_67.backend.repository.UserRepository;
import com.g9_latam_team_67.backend.service.ClasificacionService;
import com.g9_latam_team_67.backend.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ContenidoControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ContenidoRepository contenidoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @MockitoBean
    private ClasificacionService clasificacionService;

    private User usuarioAutenticado;
    private String tokenValido;

    @BeforeEach
    void prepararPrueba() {
        contenidoRepository.deleteAll();
        userRepository.deleteAll();

        usuarioAutenticado = userRepository.save(nuevoUsuario("usuario@techmind.test"));
        tokenValido = tokenService.generateToken(usuarioAutenticado);

        when(clasificacionService.enviarTexto(any(ClasificacionApiRequest.class)))
                .thenReturn(new ClasificacionApiResponse("Backend", new BigDecimal("0.95")));
    }

    @Test
    void postExitoso() throws Exception {
        mockMvc.perform(post("/api/contenido")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
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
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
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

        mockMvc.perform(get("/api/contenido")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].categoria").value("Backend"));
    }

    @Test
    void getPorIdDevuelveContenido() throws Exception {
        long id = crearContenido();

        mockMvc.perform(get("/api/contenido/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.titulo").value("Introducción a Spring Boot"));
    }

    @Test
    void getPorIdInexistenteDevuelveNotFound() throws Exception {
        mockMvc.perform(get("/api/contenido/{id}", 999999)
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    void clasificacionSinJwtDevuelveUnauthorized() throws Exception {
        mockMvc.perform(post("/api/contenido/clasificar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contenidoValido()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void clasificacionConJwtInvalidoDevuelveUnauthorized() throws Exception {
        mockMvc.perform(post("/api/contenido/clasificar")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer token-invalido")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contenidoValido()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void clasificacionConUsuarioInactivoDevuelveUnauthorized() throws Exception {
        usuarioAutenticado.setActive(false);
        userRepository.saveAndFlush(usuarioAutenticado);

        mockMvc.perform(post("/api/contenido/clasificar")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contenidoValido()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void clasificacionConUsuarioEliminadoDevuelveUnauthorized() throws Exception {
        userRepository.delete(usuarioAutenticado);
        userRepository.flush();

        mockMvc.perform(post("/api/contenido/clasificar")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contenidoValido()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void clasificacionConJwtValidoGuardaElUsuarioAutenticado() throws Exception {
        mockMvc.perform(post("/api/contenido/clasificar")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contenidoValido()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.titulo").value("Introducción a Spring Boot"))
                .andExpect(jsonPath("$.categoria").value("Backend"))
                .andExpect(jsonPath("$.probabilidad").value(0.95))
                .andExpect(jsonPath("$.fecha").exists())
                .andExpect(jsonPath("$.usuario").doesNotExist());

        Contenido guardado = contenidoRepository.findAll().get(0);
        assertThat(guardado.getUsuario()).isNotNull();
        assertThat(guardado.getUsuario().getEmail()).isEqualTo(usuarioAutenticado.getEmail());
    }

    @Test
    void usuarioIdEnLaSolicitudNoPuedeCambiarLaAsociacion() throws Exception {
        User otroUsuario = userRepository.save(nuevoUsuario("otro@techmind.test"));

        mockMvc.perform(post("/api/contenido/clasificar")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo": "Introducción a Spring Boot",
                                  "texto": "Aprende a desarrollar APIs REST utilizando Java y Spring Boot.",
                                  "usuarioId": %d
                                }
                                """.formatted(otroUsuario.getId())))
                .andExpect(status().isCreated());

        Contenido guardado = contenidoRepository.findAll().get(0);
        assertThat(guardado.getUsuario().getId()).isEqualTo(usuarioAutenticado.getId());
        assertThat(guardado.getUsuario().getId()).isNotEqualTo(otroUsuario.getId());
    }

    private long crearContenido() throws Exception {
        String response = mockMvc.perform(post("/api/contenido")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contenidoValido()))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return Long.parseLong(response.replaceAll(".*\\\"id\\\":(\\d+).*", "$1"));
    }

    private String bearerToken() {
        return "Bearer " + tokenValido;
    }

    private User nuevoUsuario(String email) {
        LocalDateTime ahora = LocalDateTime.now();
        return User.builder()
                .name("Usuario de prueba")
                .email(email)
                .password("password-cifrado")
                .role(Role.USER)
                .active(true)
                .createdAt(ahora)
                .updatedAt(ahora)
                .build();
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
