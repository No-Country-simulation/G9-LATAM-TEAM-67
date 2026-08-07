package com.g9_latam_team_67.backend.controller;

import com.g9_latam_team_67.backend.entity.Role;
import com.g9_latam_team_67.backend.entity.User;
import com.g9_latam_team_67.backend.repository.ContenidoRepository;
import com.g9_latam_team_67.backend.repository.UserRepository;
import com.g9_latam_team_67.backend.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContenidoRepository contenidoRepository;

    @Autowired
    private TokenService tokenService;

    private String tokenUsuario;
    private String tokenAdmin;
    private User usuarioObjetivo;

    @BeforeEach
    void prepararUsuarios() {
        contenidoRepository.deleteAll();
        userRepository.deleteAll();

        User usuario = userRepository.save(nuevoUsuario("user@techmind.test", Role.USER));
        User admin = userRepository.save(nuevoUsuario("admin@techmind.test", Role.ADMIN));
        usuarioObjetivo = userRepository.save(nuevoUsuario("target@techmind.test", Role.USER));

        tokenUsuario = tokenService.generateToken(usuario);
        tokenAdmin = tokenService.generateToken(admin);
    }

    @Test
    void listarUsuariosSinTokenDevuelveUnauthorized() throws Exception {
        mockMvc.perform(get("/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listarUsuariosConRolUserDevuelveForbidden() throws Exception {
        mockMvc.perform(get("/users")
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenUsuario)))
                .andExpect(status().isForbidden());
    }

    @Test
    void listarUsuariosConRolAdminEstaPermitido() throws Exception {
        mockMvc.perform(get("/users")
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenAdmin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void eliminarUsuarioSinTokenDevuelveUnauthorized() throws Exception {
        mockMvc.perform(delete("/users/{id}", usuarioObjetivo.getId()))
                .andExpect(status().isUnauthorized());

        assertThat(userRepository.existsById(usuarioObjetivo.getId())).isTrue();
    }

    @Test
    void eliminarUsuarioConRolUserDevuelveForbidden() throws Exception {
        mockMvc.perform(delete("/users/{id}", usuarioObjetivo.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenUsuario)))
                .andExpect(status().isForbidden());

        assertThat(userRepository.existsById(usuarioObjetivo.getId())).isTrue();
    }

    @Test
    void eliminarUsuarioConRolAdminEstaPermitido() throws Exception {
        mockMvc.perform(delete("/users/{id}", usuarioObjetivo.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenAdmin)))
                .andExpect(status().isNoContent());

        assertThat(userRepository.existsById(usuarioObjetivo.getId())).isFalse();
    }

    private String bearer(String token) {
        return "Bearer " + token;
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
}
