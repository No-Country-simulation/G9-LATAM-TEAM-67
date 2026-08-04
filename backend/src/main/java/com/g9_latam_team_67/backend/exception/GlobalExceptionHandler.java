package com.g9_latam_team_67.backend.exception;

import com.g9_latam_team_67.backend.dto.error.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleResourceAlreadyExists(
            ResourceAlreadyExistsException ex,
            HttpServletRequest request
    ) {
        return error(HttpStatus.CONFLICT, "Recurso existente", ex.getMessage(), request);
    }

    @ExceptionHandler({ResourceNotFoundException.class, ContenidoNoEncontradoException.class})
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            RuntimeException ex,
            HttpServletRequest request
    ) {
        return error(HttpStatus.NOT_FOUND, "Recurso no encontrado", ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return error(HttpStatus.BAD_REQUEST, "Solicitud inválida", message, request);
    }

    @ExceptionHandler({ClassifierUnavailableException.class, ClassifierTimeoutException.class})
    public ResponseEntity<ErrorResponse> handleClassifierUnavailable(
            RuntimeException ex,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Servicio de clasificación no disponible",
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler({ClassifierUpstreamException.class, InvalidClassifierResponseException.class})
    public ResponseEntity<ErrorResponse> handleInvalidClassifierResponse(
            RuntimeException ex,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.BAD_GATEWAY,
                "Respuesta inválida del servicio de clasificación",
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(
            ResponseStatusException ex,
            HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        return error(status, status.getReasonPhrase(), ex.getReason(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedError(
            Exception ex,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error interno",
                "No fue posible completar la solicitud.",
                request
        );
    }

    private ResponseEntity<ErrorResponse> error(
            HttpStatus status,
            String error,
            String message,
            HttpServletRequest request
    ) {
        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                error,
                message,
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(response);
    }
}
