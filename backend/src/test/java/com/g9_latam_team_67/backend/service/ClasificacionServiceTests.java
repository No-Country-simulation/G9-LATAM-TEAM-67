package com.g9_latam_team_67.backend.service;

import com.g9_latam_team_67.backend.dto.contenido.ClasificacionApiRequest;
import com.g9_latam_team_67.backend.dto.contenido.ClasificacionApiResponse;
import com.g9_latam_team_67.backend.exception.ClassifierTimeoutException;
import com.g9_latam_team_67.backend.exception.ClassifierUnavailableException;
import com.g9_latam_team_67.backend.exception.ClassifierUpstreamException;
import com.g9_latam_team_67.backend.exception.InvalidClassifierResponseException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.ConnectException;
import java.net.SocketTimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClasificacionServiceTests {

    private static final String CLASSIFIER_URL = "http://classifier.test/predict";

    @Mock
    private RestTemplate restTemplate;

    private ClasificacionService clasificacionService;

    @BeforeEach
    void setUp() {
        clasificacionService = new ClasificacionService(restTemplate, CLASSIFIER_URL);
    }

    @Test
    void respuestaValidaEsRetornada() {
        ClasificacionApiResponse expected = new ClasificacionApiResponse(
                "Backend",
                new BigDecimal("0.95")
        );
        mockResponse(expected);

        ClasificacionApiResponse actual = clasificacionService.enviarTexto(request());

        assertThat(actual).isEqualTo(expected);
    }

    @Test
    void conexionRechazadaGeneraUnavailable() {
        mockFailure(new ResourceAccessException("connection refused", new ConnectException()));

        assertThatThrownBy(() -> clasificacionService.enviarTexto(request()))
                .isInstanceOf(ClassifierUnavailableException.class);
    }

    @Test
    void timeoutGeneraClassifierTimeout() {
        mockFailure(new ResourceAccessException("read timed out", new SocketTimeoutException()));

        assertThatThrownBy(() -> clasificacionService.enviarTexto(request()))
                .isInstanceOf(ClassifierTimeoutException.class);
    }

    @Test
    void respuestaHttpNoExitosaGeneraUpstreamError() {
        mockFailure(HttpServerErrorException.create(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "error",
                HttpHeaders.EMPTY,
                new byte[0],
                null
        ));

        assertThatThrownBy(() -> clasificacionService.enviarTexto(request()))
                .isInstanceOf(ClassifierUpstreamException.class);
    }

    @Test
    void jsonInvalidoGeneraInvalidResponse() {
        mockFailure(new RestClientException("No fue posible convertir el JSON"));

        assertThatThrownBy(() -> clasificacionService.enviarTexto(request()))
                .isInstanceOf(InvalidClassifierResponseException.class);
    }

    @Test
    void categoriaAusenteGeneraInvalidResponse() {
        mockResponse(new ClasificacionApiResponse(null, new BigDecimal("0.95")));

        assertThatThrownBy(() -> clasificacionService.enviarTexto(request()))
                .isInstanceOf(InvalidClassifierResponseException.class);
    }

    @Test
    void probabilidadAusenteGeneraInvalidResponse() {
        mockResponse(new ClasificacionApiResponse("Backend", null));

        assertThatThrownBy(() -> clasificacionService.enviarTexto(request()))
                .isInstanceOf(InvalidClassifierResponseException.class);
    }

    @Test
    void probabilidadFueraDeRangoGeneraInvalidResponse() {
        mockResponse(new ClasificacionApiResponse("Backend", new BigDecimal("1.01")));

        assertThatThrownBy(() -> clasificacionService.enviarTexto(request()))
                .isInstanceOf(InvalidClassifierResponseException.class);
    }

    private ClasificacionApiRequest request() {
        return new ClasificacionApiRequest("Texto técnico para clasificar");
    }

    private void mockResponse(ClasificacionApiResponse response) {
        when(restTemplate.postForObject(
                eq(CLASSIFIER_URL),
                any(HttpEntity.class),
                eq(ClasificacionApiResponse.class)
        )).thenReturn(response);
    }

    private void mockFailure(RestClientException exception) {
        when(restTemplate.postForObject(
                eq(CLASSIFIER_URL),
                any(HttpEntity.class),
                eq(ClasificacionApiResponse.class)
        )).thenThrow(exception);
    }
}
