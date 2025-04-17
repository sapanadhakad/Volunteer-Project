package com.volunteer.management.dto;

import lombok.Data; // Or use explicit getters/setters/constructors
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerDetailsDto {
     // No ID needed from client for update usually
     // No userId needed from client if passed in URL
     private String phoneNumber;
     private String availability;
     private String skills;
}