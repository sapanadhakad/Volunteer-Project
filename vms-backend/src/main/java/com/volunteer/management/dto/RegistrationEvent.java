// src/main/java/com/volunteer/management/dto/RegistrationRequest.java
package com.volunteer.management.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegistrationEvent {

    @NotNull(message = "Event ID cannot be null")
    private Long eventId;
}
