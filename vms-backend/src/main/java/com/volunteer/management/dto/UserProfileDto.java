// src/main/java/com/volunteer/management/dto/UserProfileDto.java
package com.volunteer.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor // Generates constructor for all fields: id, email, name, role
public class UserProfileDto {

    private Long id;
    private String email;
    private String name; // Matches the 'name' field in your User entity
    private String role; // Single role String - will be populated from Set<Role>

    // No need for the manual constructor anymore
}