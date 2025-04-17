package com.volunteer.management.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data
public class RegisterRequest {
    @NotBlank @Size(min = 3, max = 50)
    private String name;
    @NotBlank @Size(min = 3, max = 50)
    private String username;
    @NotBlank @Size(max = 50) @Email
    private String email;
    @NotBlank @Size(min = 6, max = 100)
    private String password;
    // Add fields for initial volunteer profile if needed (skills, phone etc.)
    @NotEmpty(message = "Please select a role") // Add validation if needed
    private String roleName; // <-- ADD THIS FIELD
}