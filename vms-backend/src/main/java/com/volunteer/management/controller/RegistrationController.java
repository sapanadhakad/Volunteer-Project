// src/main/java/com/volunteer/management/controller/RegistrationController.java
package com.volunteer.management.controller;

import com.volunteer.management.dto.RegistrationEvent;
import com.volunteer.management.entity.Event; // Assuming you return the event
import com.volunteer.management.security.services.UserDetailsImpl; // Your UserDetails implementation
import com.volunteer.management.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For authorization
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import java.util.Set;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600) // Configure CORS as needed
public class RegistrationController {

    private static final Logger log = LoggerFactory.getLogger(RegistrationController.class);
    private final RegistrationService registrationService;

    /**
     * Endpoint for the current user to register for an event.
     * Requires the user to be authenticated.
     */
    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()") // Ensures user is logged in
    public ResponseEntity<?> registerForEvent(@Valid @RequestBody RegistrationEvent registrationRequest) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId(); // Get ID from authenticated principal

        log.info("Received registration request for event ID {} from user ID {}", registrationRequest.getEventId(), currentUserId);

        // The service handles exceptions which will be translated by ControllerAdvice or default mechanisms
        Event updatedEvent = registrationService.registerCurrentUserForEvent(registrationRequest.getEventId(), currentUserId);

        // Return success - could return the updated event, a confirmation message, or just 201 Created
        // Returning just status is often sufficient for simple actions
        return ResponseEntity.status(HttpStatus.CREATED).body("Successfully registered for the event.");
        // Or return event details:
        // return ResponseEntity.status(HttpStatus.CREATED).body(updatedEvent);
    }

    /**
     * Endpoint to get the IDs of events the current user is registered for.
     * Requires the user to be authenticated.
     */
    // this api use when user click on the "My Events" button
    // @GetMapping("/myevents/ids")
    // @PreAuthorize("isAuthenticated()")
    // public ResponseEntity<Set<Long>> getMyRegisteredEventIds() {
    //     Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    //     UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    //     Long currentUserId = userDetails.getId();

    //     log.debug("Fetching registered event IDs for current user ID {}", currentUserId);
    //     Set<Long> eventIds = registrationService.getRegisteredEventIdsForCurrentUser(currentUserId);
    //     return ResponseEntity.ok(eventIds);
    // }
    @GetMapping("/myevents/ids")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Set<Long>> getMyRegisteredEventIds() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // Consider adding checks for null or anonymous authentication if necessary
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
             log.warn("Attempt to access getMyRegisteredEventIds without proper authentication.");
             // Or return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); depending on your security setup
             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetailsImpl)) {
            log.error("Unexpected principal type: {}", principal.getClass().getName());
            // Handle this unexpected state appropriately
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) principal;
        Long currentUserId = userDetails.getId();

        log.debug("Fetching registered event IDs for current user ID {}", currentUserId);
        try {
            Set<Long> eventIds = registrationService.getRegisteredEventIdsForCurrentUser(currentUserId);
            return ResponseEntity.ok(eventIds);
        } catch (Exception e) {
             log.error("Error fetching registered event IDs for user ID {}: {}", currentUserId, e.getMessage(), e);
             // Return an appropriate error response
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}