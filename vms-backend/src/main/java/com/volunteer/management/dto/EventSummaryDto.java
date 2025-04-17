package com.volunteer.management.dto;

// Using a Java Record for a simple, immutable DTO
public record EventSummaryDto(
    Long id,
    String name
) {}