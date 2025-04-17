// src/main/java/com/volunteer/management/service/RegistrationService.java
package com.volunteer.management.service;

import com.volunteer.management.entity.Event;
import com.volunteer.management.entity.User;
import com.volunteer.management.entity.Volunteer;
import com.volunteer.management.exception.ActionForbiddenException;
import com.volunteer.management.exception.RegistrationException;
import com.volunteer.management.exception.ResourceNotFoundException;
import com.volunteer.management.repository.EventRepository;
import com.volunteer.management.repository.UserRepository;
import com.volunteer.management.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Injects final fields via constructor (needs Lombok)
public class RegistrationService {

    private static final Logger log = LoggerFactory.getLogger(RegistrationService.class);

    private final EventRepository eventRepository;
    private final UserRepository userRepository; // To find the user
    private final VolunteerRepository volunteerRepository; // To find the volunteer profile

    @Transactional // Ensure atomicity
    public Event registerCurrentUserForEvent(Long eventId, Long currentUserId) {
        log.info("Attempting registration for event ID {} by user ID {}", eventId, currentUserId);

        // 1. Find the current User
        // We find the user first, assuming they must exist if authenticated
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found with ID: " + currentUserId, null));

        // 2. Find the associated Volunteer profile
        // Assuming a method like findByUser exists or similar logic
        Volunteer currentVolunteer = volunteerRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new ActionForbiddenException("No volunteer profile found for user ID: " + currentUserId + ". Cannot register for events."));

        // 3. Find the Event
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId, null));

        // 4. Validation Checks
        // Check if already registered
        if (event.getAssignedVolunteers().contains(currentVolunteer)) {
            log.warn("User ID {} (Volunteer ID {}) already registered for event ID {}", currentUserId, currentVolunteer.getId(), eventId);
            throw new RegistrationException("You are already registered for this event: " + event.getName());
        }

        // Check if slots are available
        Integer slots = event.getSlotsAvailable();
        if (slots != null && event.getAssignedVolunteers().size() >= slots) {
            log.warn("No slots available for event ID {} ({} available, {} registered)", eventId, slots, event.getAssignedVolunteers().size());
            throw new RegistrationException("Sorry, no more slots available for this event: " + event.getName());
        }

        // Prevent organizer from registering as a volunteer for their own event? (Optional check)
        // if (event.getOrganizer().getId().equals(currentUserId)) {
        //     log.warn("Organizer (User ID {}) cannot register as volunteer for their own event (ID {})", currentUserId, eventId);
        //     throw new RegistrationException("Organizers cannot register as volunteers for their own events.");
        // }

        // 5. Perform Registration
        event.getAssignedVolunteers().add(currentVolunteer);

        // 6. Save the updated Event (cascades the JoinTable update)
        Event savedEvent = eventRepository.save(event);
        log.info("Successfully registered volunteer ID {} for event ID {}", currentVolunteer.getId(), eventId);

        return savedEvent; // Return the updated event (or a DTO representation)
    }

    @Transactional(readOnly = true) // Read-only transaction is efficient
    public Set<Long> getRegisteredEventIdsForCurrentUser(Long currentUserId) {
        log.debug("Fetching registered event IDs for user ID {}", currentUserId);

        // Find the associated Volunteer profile
        Volunteer currentVolunteer = volunteerRepository.findByUserId(currentUserId)
                 .orElseThrow(() -> new ActionForbiddenException("No volunteer profile found for user ID: " + currentUserId + ". Cannot fetch registrations."));


        // Find events where this volunteer is assigned
        // Ensure you have this method defined in EventRepository
        List<Event> registeredEvents = eventRepository.findByAssignedVolunteersContains(currentVolunteer);

        Set<Long> eventIds = registeredEvents.stream()
                .map(Event::getId)
                .collect(Collectors.toSet());

        log.debug("Found {} registered event IDs for user ID {}: {}", eventIds.size(), currentUserId, eventIds);
        return eventIds;
    }
}