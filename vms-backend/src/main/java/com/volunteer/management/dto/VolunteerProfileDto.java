package com.volunteer.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerProfileDto {
     private Long volunteerRecordId; // ID of the volunteer table entry
     private Long userId;
     private String name; // From User
     private String email; // From User
     private String phoneNumber; // From Volunteer
     private String availability; // From Volunteer
     private String skills; // From Volunteer
     // Add other relevant fields from User or Volunteer as needed
}

