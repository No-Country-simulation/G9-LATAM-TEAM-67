package com.g9_latam_team_67.backend.controller;

import com.g9_latam_team_67.backend.entity.Role;
import com.g9_latam_team_67.backend.entity.User;
import com.g9_latam_team_67.backend.repository.ContenidoRepository;
import com.g9_latam_team_67.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContenidoRepository contenidoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void limpiarDatos() {
        contenidoRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registroValidoCreaUsuarioNormalActivo() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Ada Lovelace",
                                  "email": "ada@techmind.test",
                                  "password": "password-seguro"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Ada Lovelace"))
                .andExpect(jsonPath("$.email").value("ada@techmind.test"))
                .andExpect(jsonPath("$.password").doesNotExist());

        User user = userRepository.findByEmail("ada@techmind.test").orElseThrow();
        assertThat(user.getRole()).isEqualTo(Role.USER);
        assertThat(user.getActive()).isTrue();
        assertThat(passwordEncoder.matches("password-seguro", user.getPassword())).isTrue();
    }

    @Test
    void registroConDatosInvalidosDevuelveBadRequest() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "",
                                  "email": "correo-invalido",
                                  "password": "x"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Solicitud inválida"));

        assertThat(userRepository.count()).isZero();
    }

    @Test
    void loginCorrectoDevuelveTokenYDatosDeSesion() throws Exception {
        guardarUsuario("login@techmind.test", "password-correcto");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "login@techmind.test",
                                  "password": "password-correcto"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("login@techmind.test"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void loginConPasswordIncorrectoDevuelveUnauthorized() throws Exception {
        guardarUsuario("login@techmind.test", "password-correcto");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "login@techmind.test",
                                  "password": "incorrecto"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    private void guardarUsuario(String email, String rawPassword) {
        LocalDateTime ahora = LocalDateTime.now();
        userRepository.save(User.builder()
                .name("Usuario de login")
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.USER)
                .active(true)
                .createdAt(ahora)
                .updatedAt(ahora)
                .build());
    }
}
