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
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.ConnectException;
import java.net.SocketTimeoutException;

@Service
public class ClasificacionService {

    private static final BigDecimal MIN_PROBABILITY = BigDecimal.ZERO;
    private static final BigDecimal MAX_PROBABILITY = BigDecimal.ONE;

    private final RestTemplate restTemplate;
    private final String classifierApiUrl;

    public ClasificacionService(
            RestTemplate restTemplate,
            @Value("${classifier.api.url}") String classifierApiUrl
    ) {
        this.restTemplate = restTemplate;
        this.classifierApiUrl = classifierApiUrl;
    }

    public ClasificacionApiResponse enviarTexto(ClasificacionApiRequest apiRequest) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<ClasificacionApiRequest> requestEntity = new HttpEntity<> (apiRequest, headers);

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
            throw new ClassifierUpstreamException();
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
}
