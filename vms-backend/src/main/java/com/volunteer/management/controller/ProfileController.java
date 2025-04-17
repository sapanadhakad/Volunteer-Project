// src/main/java/com/volunteer/management/controller/ProfileController.java
// Example: Combine profile related endpoints
package com.volunteer.management.controller;

import com.volunteer.management.dto.VolunteerDetailsDto;
import com.volunteer.management.dto.VolunteerProfileDto;
import com.volunteer.management.exception.ResourceNotFoundException;
import com.volunteer.management.service.VolunteerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For authorization
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
// ... other imports
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/profile") // Base path for profile related actions
@RequiredArgsConstructor
public class ProfileController {

    private final VolunteerService volunteerService;
    // Inject UserService if needed for user-only updates

    // GET Endpoint to fetch combined volunteer profile details for a user
    @GetMapping("/volunteer/{userId}")
    @PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')") // Secure: Only own profile or Admin
    public ResponseEntity<VolunteerProfileDto> getVolunteerProfile(@PathVariable Long userId) {
         try {
            VolunteerProfileDto profileDto = volunteerService.getVolunteerProfileByUserId(userId);
            return ResponseEntity.ok(profileDto);
        } catch (ResourceNotFoundException e) {
            // Return 404 if volunteer profile *specifically* doesn't exist for the user
            // Note: UserService might handle user-not-found earlier if you fetch user first
            return ResponseEntity.notFound().build();
        }
    }

    // PUT Endpoint to create/update volunteer details for a user
    @PutMapping("/volunteer/{userId}")
    @PreAuthorize("#userId == authentication.principal.id") // Secure: Only update own profile
    public ResponseEntity<VolunteerProfileDto> updateVolunteerDetails(
        @PathVariable Long userId,
        @Valid @RequestBody VolunteerDetailsDto detailsDto) {
        // The service method handles create or update logic
        VolunteerProfileDto updatedProfile = volunteerService.createOrUpdateVolunteerDetails(userId, detailsDto);
        return ResponseEntity.ok(updatedProfile);
    }

     // Add endpoints for User details update if needed (using UserService)
     // @PutMapping("/user/{userId}") ... using UserProfileUpdateDto ...

}