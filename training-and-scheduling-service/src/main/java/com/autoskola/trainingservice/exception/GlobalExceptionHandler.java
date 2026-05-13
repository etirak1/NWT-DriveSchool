package com.autoskola.trainingservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Hvata greške validacije (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String defaultMsg = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return new ResponseEntity<>(new ErrorResponse("VALIDATION_FAILED", defaultMsg), HttpStatus.BAD_REQUEST);
    }

    // Hvata greške kada resurs nije pronađen
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException ex) {
        return new ResponseEntity<>(new ErrorResponse("RESOURCE_NOT_FOUND", ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "FORBIDDEN");
        response.put("message", "Nemate privilegije za izvršavanje ove akcije.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
}