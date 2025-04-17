package com.volunteer.management.controller;

// --- Necessary Imports ---
import com.volunteer.management.dto.EventDto;
import com.volunteer.management.dto.EventSummaryDto; // <-- IMPORT the new DTO
import com.volunteer.management.entity.Event;      // <-- IMPORT Event entity
import com.volunteer.management.entity.User;
import com.volunteer.management.repository.EventRepository; // <-- IMPORT EventRepository
import com.volunteer.management.repository.UserRepository;
// import com.volunteer.management.service.AuthService; // Keep if used elsewhere
import com.volunteer.management.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor; // Use Lombok for constructor injection

// Remove explicit @Autowired if using RequiredArgsConstructor for all fields
// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.stream.Collectors; // <-- IMPORT Collectors

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor // Injects all final fields via constructor
public class EventController {

    private final EventService eventService;
    // private final AuthService authService; // Keep if needed
    private final UserRepository userRepository; // Use final for consistent injection
    private final EventRepository eventRepository; // <-- Inject EventRepository

    // === Public Endpoints ===

    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    // === Create Event (Requires Organizer/Admin) ===

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<EventDto> createEvent(@Valid @RequestBody EventDto eventDto, Authentication authentication) {

        // 1. Get username from principal
        Object principal = authentication.getPrincipal();
         String username;

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
         } else if (principal instanceof String) { // Handle cases where principal might be just the username String
              username = (String) principal;
         }
          else {
            // Consider logging a warning or throwing a more specific internal error
             throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected principal type: " + principal.getClass().getName());
         }


        // 2. Fetch the User entity from the database
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user '" + username + "' not found in database"));

        // 3. Call the service with the DTO and the fetched User entity
        EventDto createdEvent = eventService.createEvent(eventDto, currentUser); // Ensure service method accepts User

        System.out.println("Event created successfully for user: " + username);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    // === Update Event (Requires Admin or Organizer of the event) ===

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @eventSecurityService.isOrganizerOfEvent(#id, authentication)") // Adjusted security expression
    public ResponseEntity<EventDto> updateEvent(@PathVariable Long id, @Valid @RequestBody EventDto eventDto, Authentication authentication) {
        // Consider passing 'authentication' or the User object to the service if needed for checks
        EventDto updatedEvent = eventService.updateEvent(id, eventDto);
        return ResponseEntity.ok(updatedEvent);
    }

    // === Delete Event (Requires Admin or Organizer of the event) ===

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @eventSecurityService.isOrganizerOfEvent(#id, authentication)") // Adjusted security expression
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id, Authentication authentication) {
        // Consider passing 'authentication' or the User object to the service if needed for checks
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    // === Assign/Unassign Volunteers (Requires Admin or Organizer of the event) ===

    @PostMapping("/{eventId}/assign/{volunteerId}")
    @PreAuthorize("hasRole('ADMIN') or @eventSecurityService.isOrganizerOfEvent(#eventId, authentication)") // Adjusted security expression
    public ResponseEntity<EventDto> assignVolunteer(@PathVariable Long eventId, @PathVariable Long volunteerId, Authentication authentication) {
         EventDto updatedEvent = eventService.assignVolunteerToEvent(eventId, volunteerId);
         return ResponseEntity.ok(updatedEvent);
    }

     @DeleteMapping("/{eventId}/unassign/{volunteerId}")
     @PreAuthorize("hasRole('ADMIN') or @eventSecurityService.isOrganizerOfEvent(#eventId, authentication)") // Adjusted security expression
    public ResponseEntity<EventDto> unassignVolunteer(@PathVariable Long eventId, @PathVariable Long volunteerId, Authentication authentication) {
         EventDto updatedEvent = eventService.unassignVolunteerFromEvent(eventId, volunteerId);
         return ResponseEntity.ok(updatedEvent);
    }

    // === Get Events Organized by Current User (Requires Organizer role) ===

    @GetMapping("/my-organized")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<List<EventSummaryDto>> getMyOrganizedEvents(Authentication authentication) {

        // 1. Get username from principal (same logic as createEvent)
        Object principal = authentication.getPrincipal();
        String username;

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
         } else if (principal instanceof String) {
             username = (String) principal;
        } else {
             throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected principal type: " + principal.getClass().getName());
        }

        // 2. Fetch the User entity for the organizer
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Organizer user '" + username + "' not found in database"));

        // 3. Fetch events created by this organizer using EventRepository
        //    Make sure you have a method like this in your EventRepository interface:
        //    List<Event> findByOrganizer(User organizer);
        List<Event> organizedEvents = eventRepository.findByOrganizer(currentUser);

        // 4. Map the results to EventSummaryDto
        List<EventSummaryDto> eventSummaries = organizedEvents.stream()
                .map(event -> new EventSummaryDto(event.getId(), event.getName())) // Map Event entity to DTO
                .collect(Collectors.toList());

        return ResponseEntity.ok(eventSummaries);
    }

}