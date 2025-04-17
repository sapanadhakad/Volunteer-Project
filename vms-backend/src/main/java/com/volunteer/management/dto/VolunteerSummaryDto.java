package com.volunteer.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerSummaryDto {
    private Long id;
    private String name; // Name comes from associated User
    private String email; // Email comes from associated User
    private String phoneNumber;
    private String skills;
    private String availability;
    // No relationships needed here
}