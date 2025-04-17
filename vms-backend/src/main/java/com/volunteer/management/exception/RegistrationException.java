package com.volunteer.management.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT) // 409 Conflict is often suitable here
public class RegistrationException extends RuntimeException {
    public RegistrationException(String message) {
        super(message);
    }
}
