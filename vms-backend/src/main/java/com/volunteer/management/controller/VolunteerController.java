package com.volunteer.management.controller;

// --- Necessary Imports ---
import com.volunteer.management.dto.EventSummaryDto;   // <-- IMPORT Summary DTO
import com.volunteer.management.dto.VolunteerDto;
import com.volunteer.management.entity.Event;         // <-- IMPORT Event entity
import com.volunteer.management.entity.User;          // <-- IMPORT User entity
import com.volunteer.management.entity.Volunteer;     // <-- IMPORT Volunteer entity
import com.volunteer.management.repository.UserRepository;      // <-- IMPORT UserRepository
import com.volunteer.management.repository.VolunteerRepository; // <-- IMPORT VolunteerRepository
import com.volunteer.management.service.VolunteerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails; // <-- IMPORT UserDetails
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException; // <-- IMPORT ResponseStatusException

import java.util.List;
import java.util.Set; // <-- IMPORT Set
import java.util.stream.Collectors; // <-- IMPORT Collectors

@RestController
@RequestMapping("/api") // Changed base path slightly to avoid conflict if needed, or keep as /volunteers if separate endpoints are desired
@RequiredArgsConstructor
public class VolunteerController {

    private final VolunteerService volunteerService;
    private final UserRepository userRepository; // <-- Inject UserRepository
    private final VolunteerRepository volunteerRepository; // <-- Inject VolunteerRepository

    // === Standard Volunteer CRUD Endpoints ===

    @GetMapping("/volunteers") // Full path: /api/volunteers
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VolunteerDto>> getAllVolunteers() {
        List<VolunteerDto> volunteers = volunteerService.getAllVolunteers();
        return ResponseEntity.ok(volunteers);
    }

    @GetMapping("/volunteers/{id}") // Full path: /api/volunteers/{id}
    public ResponseEntity<VolunteerDto> getVolunteerById(@PathVariable Long id) {
        VolunteerDto volunteerDto = volunteerService.getVolunteerById(id);
        return ResponseEntity.ok(volunteerDto);
    }

    @PostMapping("/volunteers") // Full path: /api/volunteers
    public ResponseEntity<VolunteerDto> createVolunteer(@Valid @RequestBody VolunteerDto volunteerDto) {
        VolunteerDto createdVolunteer = volunteerService.createVolunteer(volunteerDto);
        return new ResponseEntity<>(createdVolunteer, HttpStatus.CREATED);
    }

    @PutMapping("/volunteers/{id}") // Full path: /api/volunteers/{id}
    // Add appropriate security check, e.g., Admin or the volunteer themselves
    @PreAuthorize("hasRole('ADMIN') or @volunteerSecurityService.isSelf(#id, authentication)")
    public ResponseEntity<VolunteerDto> updateVolunteer(@PathVariable Long id, @Valid @RequestBody VolunteerDto volunteerDto, Authentication authentication) {
        // Consider passing authentication or user to service if needed for checks
        VolunteerDto updatedVolunteer = volunteerService.updateVolunteer(id, volunteerDto);
        return ResponseEntity.ok(updatedVolunteer);
    }

    @DeleteMapping("/volunteers/{id}") // Full path: /api/volunteers/{id}
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVolunteer(@PathVariable Long id) {
        volunteerService.deleteVolunteer(id);
        return ResponseEntity.noContent().build();
    }


    // === Get Events Registered by Current Volunteer ===

    @GetMapping("/volunteers/registered-events") // Full path: /api/volunteer/registered-events
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<?> getMyRegisteredEvents(Authentication authentication) { // ResponseEntity<?> for flexible response

        // 1. Get username from principal
        Object principal = authentication.getPrincipal();
        String username;

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
             username = (String) principal;
        } else {
             throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected principal type: " + principal.getClass().getName());
        }

        // 2. Fetch the User entity
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user '" + username + "' not found"));

        // 3. Find the associated Volunteer profile using VolunteerRepository
        //    Make sure you have a method like this in VolunteerRepository interface:
        //    Optional<Volunteer> findByUser(User user);
        Volunteer volunteer = volunteerRepository.findByUser(currentUser)
                .orElse(null); // Handle case where volunteer profile might not exist

        if (volunteer == null) {
            // Return 404 Not Found if the volunteer profile doesn't exist for this user
            // Sending a structured error message is often better than just a string
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body(java.util.Map.of( // Example structured error
                                     "timestamp", java.time.Instant.now(),
                                     "status", HttpStatus.NOT_FOUND.value(),
                                     "error", "Not Found",
                                     "message", "Volunteer profile not found for user ID: " + currentUser.getId(),
                                     "path", "/api/volunteer/registered-events"
                                  ));
        }

        // 4. Get registered events from the volunteer entity
        //    Ensure the FetchType allows accessing assignedEvents here, or fetch eagerly/join fetch in the repository method if needed.
        Set<Event> registeredEvents = volunteer.getAssignedEvents();

        // 5. Map to DTOs (Make sure EventSummaryDto is defined and imported)
        List<EventSummaryDto> eventSummaries = registeredEvents.stream()
                .map(event -> new EventSummaryDto(event.getId(), event.getName())) // Map Event to EventSummaryDto
                .collect(Collectors.toList());

        return ResponseEntity.ok(eventSummaries);
    }

}