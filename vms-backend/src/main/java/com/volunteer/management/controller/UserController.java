// src/main/java/com/volunteer/management/controller/UserController.java
package com.volunteer.management.controller;

import com.volunteer.management.dto.UserProfileDto;
import com.volunteer.management.dto.UserProfileUpdateDto;
import com.volunteer.management.entity.Role; // Import Role
import com.volunteer.management.entity.User;
import com.volunteer.management.service.UserService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority; // Import GrantedAuthority
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator; // Import Comparator
import java.util.Optional; // Import Optional

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200") // Adjust as needed
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // --- GET Current User Profile ---
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        }

        // Since UserDetails uses username, getName() should return the username
        String username = authentication.getName();

        try {
            User user = userService.findUserByUsername(username);
            UserProfileDto userProfileDto = mapUserToProfileDto(user, authentication); // Pass authentication for more role context if needed
            return ResponseEntity.ok(userProfileDto);

        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User profile not found.");
        } catch (Exception e) {
            // Log exception e
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving user profile.");
        }
    }

    // --- PUT Update Current User Profile ---
    @PutMapping("/me")
    public ResponseEntity<?> updateUserProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileUpdateDto updateDto) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        }

        String username = authentication.getName();

        try {
            User updatedUser = userService.updateUserProfile(username, updateDto);
            UserProfileDto updatedProfileDto = mapUserToProfileDto(updatedUser, authentication);
            return ResponseEntity.ok(updatedProfileDto);

        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User profile not found.");
        }  catch (Exception e) {
             // Log exception e
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating user profile.");
        }
    }


    // --- Helper Method to Map User to DTO ---
    private UserProfileDto mapUserToProfileDto(User user, Authentication authentication) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName()); // Use the 'name' field

        // Strategy to get a single role string (customize as needed):
        // Option 1: Simple - Get the first role found (if any)
        // String roleName = user.getRoles().stream().findFirst().map(Role::getName).orElse("N/A");

        // Option 2: Prioritize - Prefer ADMIN over VOLUNTEER, etc.
        Optional<String> primaryRole = user.getRoles().stream()
                                          .map(Role::getName) // Get role names (e.g., "ROLE_ADMIN", "ROLE_VOLUNTEER")
                                          .sorted(rolePriorityComparator()) // Sort by priority
                                          .findFirst(); // Get the highest priority one

        dto.setRole(primaryRole.orElse("ROLE_USER")); // Provide a default if no roles found

        // Option 3: Use roles directly from Authentication object (already processed by UserDetailsService)
        // String authRole = authentication.getAuthorities().stream()
        //                         .map(GrantedAuthority::getAuthority)
        //                         .sorted(rolePriorityComparator()) // Sort by priority
        //                         .findFirst()
        //                         .orElse("ROLE_USER");
        // dto.setRole(authRole);


        return dto;
    }

    // Comparator for Role Priority (Example: Admin > Volunteer > User)
    private Comparator<String> rolePriorityComparator() {
        return Comparator.comparingInt(role -> {
            if (role.equalsIgnoreCase("ROLE_ADMIN")) return 0;
            if (role.equalsIgnoreCase("ROLE_VOLUNTEER")) return 1; // Adjust role names if different
            // Add other roles here
            return 100; // Lower priority for others
        });
    }






    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        // The try-catch block is one way to handle the exception directly here.
        // Often, a global @ControllerAdvice exception handler is preferred for cleaner controllers.
        try {
            User user = userService.findUserById(id);
            return ResponseEntity.ok(user); // Return 200 OK with the user data
        } catch (UsernameNotFoundException e) { // Catch the specific exception thrown by the service
            // Log the error if desired: log.warn("User not found for ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build(); // Return 404 Not Found
        }
        // If findUserById throws other potential runtime exceptions, you might need
        // broader catch blocks or rely on a global exception handler.
    }
}