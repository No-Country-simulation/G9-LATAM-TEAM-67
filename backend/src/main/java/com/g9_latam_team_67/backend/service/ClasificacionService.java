package com.g9_latam_team_67.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.g9_latam_team_67.backend.dto.contenido.ClasificacionApiRequest;
import com.g9_latam_team_67.backend.dto.contenido.ClasificacionApiResponse;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

@Service
public class ClasificacionService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public ClasificacionService(ObjectMapper objectMapper, RestTemplate restTemplate) {
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
    }

    //quitar
    /*
    public ClasificacionApiResponse clasificar(ContenidoRequest contenido) {
        // Esta respuesta provisional será reemplazada por la integración con el modelo de Ciencia de Datos.
        return new ClasificacionApiResponse(
                "Backend",
                0.95,
                List.of("Java", "Spring Boot", "API REST")
        );
    }
     */
    //Consulta a la api de python
    public ClasificacionApiResponse enviarTexto(ClasificacionApiRequest apiRequest){

        try{
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 2. Unir las cabeceras y el objeto DTO en una sola entidad HTTP
            HttpEntity<ClasificacionApiRequest> requestEntity = new HttpEntity<> (apiRequest, headers);

            // Definir la URL completa de tu API de Python (ej: http://localhost:8000/predict)
            String urlPython = "http://150.136.252.164:8000/predict"; // Reemplaza con tu URL real

            System.out.println("Enviando con RestTemplate a Python...");

            // 3. Ejecutar el POST y mapear la respuesta automáticamente
            ClasificacionApiResponse respuesta = restTemplate.postForObject(
                    urlPython,
                    requestEntity,
                    ClasificacionApiResponse.class
            );

            return respuesta;
        } catch (HttpClientErrorException e) {
            String error = e.getResponseBodyAsString();
            System.out.println("Error 4xx de python ( "+e.getStatusCode()+" ) "+ error);
            throw new RuntimeException(" Error de validacion por python "+error);
        }
        catch (HttpServerErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            System.err.println("Error 5xx en el servidor de Python (" + e.getStatusCode() + "): " + errorBody);
            throw new RuntimeException("El servidor de Python falló internamente.");
        }
        catch (Exception e) {
            System.out.println("Error detallado al conectar con Python "+ e.getMessage());
            throw new RuntimeException("Error al comunicarse con la api de python "+e.getMessage(), e);
        }
    }
}
