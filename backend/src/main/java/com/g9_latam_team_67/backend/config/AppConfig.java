package com.g9_latam_team_67.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class AppConfig {
    @Bean
    public RestTemplate restTemplate(
            @Value("${classifier.api.connect-timeout}") long connectTimeout,
            @Value("${classifier.api.read-timeout}") long readTimeout
    ) {
        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(connectTimeout));
        requestFactory.setReadTimeout(Duration.ofMillis(readTimeout));

        // Uvicorn no soporta la negociación h2c que puede intentar el cliente
        // JDK detectado automáticamente. HttpURLConnection usa HTTP/1.1 y evita
        // que el servidor descarte el cuerpo JSON después del upgrade fallido.
        return new RestTemplate(requestFactory);
    }
}
