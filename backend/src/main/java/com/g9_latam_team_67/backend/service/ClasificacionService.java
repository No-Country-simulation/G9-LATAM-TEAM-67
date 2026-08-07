package com.g9_latam_team_67.backend.service;

import com.g9_latam_team_67.backend.dto.contenido.ClasificacionApiRequest;
import com.g9_latam_team_67.backend.dto.contenido.ClasificacionApiResponse;
import com.g9_latam_team_67.backend.exception.ClassifierTimeoutException;
import com.g9_latam_team_67.backend.exception.ClassifierUnavailableException;
import com.g9_latam_team_67.backend.exception.ClassifierUpstreamException;
import com.g9_latam_team_67.backend.exception.InvalidClassifierResponseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.ConnectException;
import java.net.URI;
import java.net.SocketTimeoutException;
import java.util.Map;

@Service
public class ClasificacionService {

    private static final Logger log = LoggerFactory.getLogger(ClasificacionService.class);
    private static final BigDecimal MIN_PROBABILITY = BigDecimal.ZERO;
    private static final BigDecimal MAX_PROBABILITY = BigDecimal.ONE;
    private static final int MAX_UPSTREAM_ERROR_BODY_LENGTH = 1000;

    private final RestTemplate restTemplate;
    private final String classifierApiUrl;

    public ClasificacionService(
            RestTemplate restTemplate,
            @Value("${classifier.api.url}") String classifierApiUrl
    ) {
        this.restTemplate = restTemplate;
        this.classifierApiUrl = classifierApiUrl.trim();

        URI uri = URI.create(this.classifierApiUrl);
        String port = uri.getPort() >= 0 ? ":" + uri.getPort() : "";
        log.info(
                "Clasificador configurado: {}://{}{}{}",
                uri.getScheme(),
                uri.getHost(),
                port,
                uri.getPath()
        );
    }

    public ClasificacionApiResponse enviarTexto(ClasificacionApiRequest apiRequest) {
        try {
            log.debug(
                    "Enviando solicitud al clasificador: longitudTexto={}",
                    apiRequest.texto() != null ? apiRequest.texto().length() : null
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, String> requestBody = Map.of("texto", apiRequest.texto());
            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

            ClasificacionApiResponse response = restTemplate.postForObject(
                    classifierApiUrl,
                    requestEntity,
                    ClasificacionApiResponse.class
            );

            validateResponse(response);
            return response;
        } catch (ResourceAccessException ex) {
            if (hasCause(ex, SocketTimeoutException.class)) {
                throw new ClassifierTimeoutException();
            }
            if (hasCause(ex, ConnectException.class)) {
                throw new ClassifierUnavailableException();
            }
            throw new ClassifierUnavailableException();
        } catch (HttpStatusCodeException ex) {
            String responseBody = sanitizeAndTruncate(
                    ex.getResponseBodyAsString(),
                    MAX_UPSTREAM_ERROR_BODY_LENGTH
            );
            MediaType contentType = ex.getResponseHeaders() != null
                    ? ex.getResponseHeaders().getContentType()
                    : null;

            log.warn(
                    "El clasificador respondió con HTTP {}. Content-Type: {}. Cuerpo: {}",
                    ex.getStatusCode().value(),
                    contentType,
                    responseBody
            );

            throw new ClassifierUpstreamException(ex.getStatusCode().value());
        } catch (RestClientException ex) {
            throw new InvalidClassifierResponseException();
        }
    }

    private void validateResponse(ClasificacionApiResponse response) {
        if (response == null
                || response.category() == null
                || response.category().isBlank()
                || response.probability() == null
                || response.probability().compareTo(MIN_PROBABILITY) < 0
                || response.probability().compareTo(MAX_PROBABILITY) > 0) {
            throw new InvalidClassifierResponseException();
        }
    }

    private boolean hasCause(Throwable throwable, Class<? extends Throwable> causeType) {
        Throwable current = throwable;
        while (current != null) {
            if (causeType.isInstance(current)) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private String sanitizeAndTruncate(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return "<vacío>";
        }

        String sanitized = value
                .replaceAll("[\\r\\n\\t]+", " ")
                .replaceAll("(?i)bearer\\s+[a-z0-9._-]+", "Bearer <oculto>");

        return sanitized.length() <= maxLength
                ? sanitized
                : sanitized.substring(0, maxLength) + "...";
    }

}
