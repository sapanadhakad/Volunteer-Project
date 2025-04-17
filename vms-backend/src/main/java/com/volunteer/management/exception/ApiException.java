package com.volunteer.management.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    private HttpStatus status;
    private String message;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
        this.message = message;
    }
    // Getters...
     public HttpStatus getStatus() { return status; }
     @Override
     public String getMessage() { return message; }
}