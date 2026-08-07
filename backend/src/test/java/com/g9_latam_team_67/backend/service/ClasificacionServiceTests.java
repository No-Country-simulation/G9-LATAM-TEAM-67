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
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.HttpClientErrorException;
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
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.http.HttpMethod.POST;

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
    void respuestaHttp400GeneraUpstreamErrorYConservaElEstado() {
        mockFailure(HttpClientErrorException.create(
                HttpStatus.BAD_REQUEST,
                "bad request",
                HttpHeaders.EMPTY,
                "detalle de validación".getBytes(),
                null
        ));

        assertThatThrownBy(() -> clasificacionService.enviarTexto(request()))
                .isInstanceOf(ClassifierUpstreamException.class)
                .satisfies(exception -> assertThat(
                        ((ClassifierUpstreamException) exception).getUpstreamStatus()
                ).isEqualTo(400));
    }

    @Test
    void respuestaHttp500GeneraUpstreamErrorYConservaElEstado() {
        mockFailure(HttpServerErrorException.create(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "error",
                HttpHeaders.EMPTY,
                new byte[0],
                null
        ));

        assertThatThrownBy(() -> clasificacionService.enviarTexto(request()))
                .isInstanceOf(ClassifierUpstreamException.class)
                .satisfies(exception -> assertThat(
                        ((ClassifierUpstreamException) exception).getUpstreamStatus()
                ).isEqualTo(500));
    }

    @Test
    void eliminaEspaciosExterioresDeLaUrlConfigurada() {
        clasificacionService = new ClasificacionService(
                restTemplate,
                "  " + CLASSIFIER_URL + "  "
        );
        mockResponse(new ClasificacionApiResponse("Backend", new BigDecimal("0.95")));

        clasificacionService.enviarTexto(request());
    }

    @Test
    void enviaElCuerpoJsonEsperadoPorLaApiPython() {
        RestTemplate realRestTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(realRestTemplate).build();
        ClasificacionService servicioReal = new ClasificacionService(
                realRestTemplate,
                CLASSIFIER_URL
        );

        server.expect(requestTo(CLASSIFIER_URL))
                .andExpect(method(POST))
                .andExpect(header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE))
                .andExpect(content().json("""
                        {"texto":"Texto técnico para clasificar"}
                        """))
                .andRespond(withSuccess("""
                        {"category":"Backend","probability":0.95}
                        """, MediaType.APPLICATION_JSON));

        ClasificacionApiResponse response = servicioReal.enviarTexto(request());

        assertThat(response.category()).isEqualTo("Backend");
        assertThat(response.probability()).isEqualByComparingTo("0.95");
        server.verify();
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
