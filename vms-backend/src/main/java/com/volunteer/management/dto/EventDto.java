package com.volunteer.management.dto;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;

@Data
public class EventDto {
    private Long id;

    @NotBlank(message = "Event name cannot be blank")
    private String name;

    private String description;
    private String location;

    @NotNull(message = "Start date/time cannot be null")
    @FutureOrPresent(message = "Start date/time must be in the present or future")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")

    private LocalDateTime startDateTime;

    @NotNull(message = "End date/time cannot be null")
    @FutureOrPresent(message = "End date/time must be in the present or future")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")

    private LocalDateTime endDateTime; // Add validation: end must be after start in service layer

    @Min(value = 0, message = "Slots available cannot be negative")
    private Integer slotsAvailable;

    private Set<VolunteerSummaryDto> assignedVolunteers = new HashSet<>();
    private Long organizerId;
    private String organizerName;
}
