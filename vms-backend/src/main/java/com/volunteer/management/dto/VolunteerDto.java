package com.volunteer.management.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerDto {

    private Long id; // Include ID for responses, but maybe not for creation requests

    // @NotBlank(message = "Volunteer name cannot be blank")
    // @Size(max = 100, message = "Name must be less than 100 characters")
    // private String name;

    // @NotBlank(message = "Email cannot be blank")
    // @Email(message = "Invalid email format")
    // @Size(max = 100)
    // private String email;

    @Size(max = 20, message = "Phone number must be less than 20 characters")
    private String phoneNumber;

    private String skills;
    private String availability;

    // --- Constructor for mapping from Entity (optional helper) ---
    // public VolunteerDto(Long id, String name, String email, String phoneNumber, String skills, String availability) {
    //     this.id = id;
    //     this.name = name;
    //     this.email = email;
    //     this.phoneNumber = phoneNumber;
    //     this.skills = skills;
    //     this.availability = availability;
    // }
}