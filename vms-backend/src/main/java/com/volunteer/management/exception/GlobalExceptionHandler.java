package com.volunteer.management.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError; // Keep this if needed elsewhere, or remove if not
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime; // Use consistent time type
import java.util.Date; // Keep if used by other handlers, otherwise switch to LocalDateTime
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Handle specific exceptions
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        // Consider switching to LocalDateTime here too for consistency
        ErrorDetails errorDetails = new ErrorDetails(new Date(), ex.getMessage(), request.getDescription(false));
        return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);
    }

    // <<<--- REMOVED handleMethodArgumentNotValid method --->>>

    // Handle global exceptions (catch-all)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleGlobalException(Exception ex, WebRequest request) {
         // Consider switching to LocalDateTime here too for consistency
        ErrorDetails errorDetails = new ErrorDetails(new Date(), ex.getMessage(), request.getDescription(false));
        // Log the exception here for debugging
        // logger.error("Unhandled exception occurred", ex);
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // <<<--- REMOVE THE FLOATING @ExceptionHandler(Exception.class) below --->>>
    // This annotation below is *also* an error - it's not attached to a method!
    // @ExceptionHandler(Exception.class) // DELETE THIS LINE

    private ResponseEntity<Object> buildErrorResponse(Exception ex, HttpStatus status, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now()); // Consistent LocalDateTime
        body.put("status", status.value());
        body.put("error", ex.getMessage()); // Use 'error' or 'message' consistently
        body.put("path", request.getDescription(false).replace("uri=", ""));
        return new ResponseEntity<>(body, status);
    }

    // Simple Error Details class
    public static class ErrorDetails {
        private Date timestamp; // Consider changing to LocalDateTime
        private String message;
        private String details;

        public ErrorDetails(Date timestamp, String message, String details) { // Adjust constructor if type changes
            this.timestamp = timestamp;
            this.message = message;
            this.details = details;
        }
        // Getters...
        public Date getTimestamp() { return timestamp; }
        public String getMessage() { return message; }
        public String getDetails() { return details; }
    }

    @ExceptionHandler(RegistrationException.class)
    public ResponseEntity<Object> handleRegistrationException(RegistrationException ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.CONFLICT, request);
    }

    @ExceptionHandler(ActionForbiddenException.class)
    public ResponseEntity<Object> handleActionForbiddenException(ActionForbiddenException ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.FORBIDDEN, request);
    }

    // Keep this one (or the other one, but only one)
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now()); // Consistent LocalDateTime
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed"); // Consistent key 'error'
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        body.put("errors", errors); // Detailed field errors
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}