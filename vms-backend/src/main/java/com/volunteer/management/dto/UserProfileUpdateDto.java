// src/main/java/com/volunteer/management/dto/UserProfileUpdateDto.java
package com.volunteer.management.dto;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserProfileUpdateDto {

    // Adjust size as needed
    private String name;

    // Optional: Allow email update? Requires uniqueness check & possibly re-verification.
   
    private String email;

    // DO NOT include 'id', 'username', 'role', 'password' here
}