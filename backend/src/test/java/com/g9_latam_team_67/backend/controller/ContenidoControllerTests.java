package com.g9_latam_team_67.backend.controller;

import com.g9_latam_team_67.backend.dto.contenido.ClasificacionApiRequest;
import com.g9_latam_team_67.backend.dto.contenido.ClasificacionApiResponse;
import com.g9_latam_team_67.backend.entity.Contenido;
import com.g9_latam_team_67.backend.entity.Role;
import com.g9_latam_team_67.backend.entity.User;
import com.g9_latam_team_67.backend.exception.ClassifierUnavailableException;
import com.g9_latam_team_67.backend.exception.ClassifierTimeoutException;
import com.g9_latam_team_67.backend.exception.InvalidClassifierResponseException;
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
    void tituloVacioDevuelveBadRequest() throws Exception {
        mockMvc.perform(post("/api/contenido")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo": "",
                                  "texto": "Texto suficientemente largo para superar la validación."
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void textoDemasiadoCortoDevuelveBadRequest() throws Exception {
        mockMvc.perform(post("/api/contenido")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo": "Título válido",
                                  "texto": "Corto"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getDevuelveLista() throws Exception {
        guardarContenido(usuarioAutenticado, "Contenido propio", "Backend");

        mockMvc.perform(get("/api/contenido")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].categoria").value("Backend"));
    }

    @Test
    void usuarioNormalListaSoloSusContenidos() throws Exception {
        User otroUsuario = userRepository.save(nuevoUsuario("otro@techmind.test"));
        guardarContenido(usuarioAutenticado, "Contenido propio", "Backend");
        guardarContenido(otroUsuario, "Contenido ajeno", "Frontend");

        mockMvc.perform(get("/api/contenido")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].titulo").value("Contenido propio"));
    }

    @Test
    void usuarioNormalVeSoloCategoriasDeSusContenidos() throws Exception {
        User otroUsuario = userRepository.save(nuevoUsuario("otro@techmind.test"));
        guardarContenido(usuarioAutenticado, "Contenido propio", "Backend");
        guardarContenido(otroUsuario, "Contenido ajeno", "Frontend");

        mockMvc.perform(get("/api/contenido/categorias")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categorias", hasSize(1)))
                .andExpect(jsonPath("$.categorias[0]").value("Backend"));
    }

    @Test
    void usuarioNormalFiltraSoloDentroDeSusContenidos() throws Exception {
        User otroUsuario = userRepository.save(nuevoUsuario("otro@techmind.test"));
        guardarContenido(usuarioAutenticado, "Backend propio", "Backend");
        guardarContenido(otroUsuario, "Backend ajeno", "Backend");

        mockMvc.perform(get("/api/contenido/buscar")
                        .param("categoria", "Backend")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].titulo").value("Backend propio"));
    }

    @Test
    void busquedaSinResultadosDevuelveListaVacia() throws Exception {
        guardarContenido(usuarioAutenticado, "Contenido propio", "Backend");

        mockMvc.perform(get("/api/contenido/buscar")
                        .param("categoria", "Frontend")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void adminListaCategoriasYFiltraContenidosGlobales() throws Exception {
        User otroUsuario = userRepository.save(nuevoUsuario("otro@techmind.test"));
        User admin = userRepository.save(nuevoUsuario("admin@techmind.test", Role.ADMIN));
        String tokenAdmin = tokenService.generateToken(admin);
        guardarContenido(usuarioAutenticado, "Backend usuario uno", "Backend");
        guardarContenido(otroUsuario, "Frontend usuario dos", "Frontend");
        guardarContenido(otroUsuario, "Backend usuario dos", "Backend");

        mockMvc.perform(get("/api/contenido")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));

        mockMvc.perform(get("/api/contenido/categorias")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categorias", hasSize(2)))
                .andExpect(jsonPath("$.categorias[0]").value("Backend"))
                .andExpect(jsonPath("$.categorias[1]").value("Frontend"));

        mockMvc.perform(get("/api/contenido/buscar")
                        .param("categoria", "Backend")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void rutasDeConsultaSinAutenticacionDevuelvenUnauthorized() throws Exception {
        mockMvc.perform(get("/api/contenido"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/contenido/categorias"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/contenido/buscar").param("categoria", "Backend"))
                .andExpect(status().isUnauthorized());
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
    void clasificadorNoDisponibleDevuelve503YNoGuardaContenido() throws Exception {
        when(clasificacionService.enviarTexto(any(ClasificacionApiRequest.class)))
                .thenThrow(new ClassifierUnavailableException());

        mockMvc.perform(post("/api/contenido/clasificar")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contenidoValido()))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.error").value("Servicio de clasificación no disponible"))
                .andExpect(jsonPath("$.message").value("No fue posible conectar con el modelo de clasificación."))
                .andExpect(jsonPath("$.path").value("/api/contenido/clasificar"));

        assertThat(contenidoRepository.count()).isZero();
    }

    @Test
    void timeoutDelClasificadorDevuelve503YNoGuardaContenido() throws Exception {
        when(clasificacionService.enviarTexto(any(ClasificacionApiRequest.class)))
                .thenThrow(new ClassifierTimeoutException());

        mockMvc.perform(post("/api/contenido/clasificar")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contenidoValido()))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.message").value("El modelo de clasificación no respondió a tiempo."))
                .andExpect(jsonPath("$.path").value("/api/contenido/clasificar"));

        assertThat(contenidoRepository.count()).isZero();
    }

    @Test
    void respuestaInvalidaDevuelve502YNoGuardaContenido() throws Exception {
        when(clasificacionService.enviarTexto(any(ClasificacionApiRequest.class)))
                .thenThrow(new InvalidClassifierResponseException());

        mockMvc.perform(post("/api/contenido/clasificar")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contenidoValido()))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.status").value(502))
                .andExpect(jsonPath("$.error").value("Respuesta inválida del servicio de clasificación"))
                .andExpect(jsonPath("$.path").value("/api/contenido/clasificar"));

        assertThat(contenidoRepository.count()).isZero();
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
        return nuevoUsuario(email, Role.USER);
    }

    private User nuevoUsuario(String email, Role role) {
        LocalDateTime ahora = LocalDateTime.now();
        return User.builder()
                .name("Usuario de prueba")
                .email(email)
                .password("password-cifrado")
                .role(role)
                .active(true)
                .createdAt(ahora)
                .updatedAt(ahora)
                .build();
    }

    private Contenido guardarContenido(User usuario, String titulo, String categoria) {
        return contenidoRepository.saveAndFlush(new Contenido(
                titulo,
                "Texto suficientemente largo para las pruebas de contenido.",
                categoria,
                new BigDecimal("0.90"),
                usuario
        ));
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
