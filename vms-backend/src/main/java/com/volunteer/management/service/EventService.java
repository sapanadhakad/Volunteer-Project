package com.volunteer.management.service;

import com.volunteer.management.dto.EventDto;
import com.volunteer.management.dto.VolunteerSummaryDto;
import com.volunteer.management.entity.Event;
import com.volunteer.management.entity.User;
import com.volunteer.management.entity.Volunteer;
import com.volunteer.management.exception.ApiException;
import com.volunteer.management.exception.ResourceNotFoundException;
import com.volunteer.management.repository.EventRepository;
import com.volunteer.management.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final VolunteerRepository volunteerRepository; // Needed for assignments

    // --- Mappers (Consider MapStruct later) ---
    private EventDto mapToDto(Event event) {
        EventDto dto = new EventDto();
        dto.setId(event.getId());
        dto.setName(event.getName());
        dto.setDescription(event.getDescription());
        dto.setLocation(event.getLocation());
        dto.setStartDateTime(event.getStartDateTime());
        dto.setEndDateTime(event.getEndDateTime());
        dto.setSlotsAvailable(event.getSlotsAvailable());
        // Map assigned volunteer IDs
        if (event.getAssignedVolunteers() != null) {
            // Map assigned volunteers to VolunteerSummaryDto objects
            dto.setAssignedVolunteers(event.getAssignedVolunteers().stream()
                    .filter(Objects::nonNull) // Ensure volunteer object is not null
                    .map(this::mapVolunteerToSummaryDto) // Use a helper method for clarity
                    .collect(Collectors.toSet()));
        } else {
            dto.setAssignedVolunteers(Collections.emptySet()); // Initialize if null
        }




        // Consider adding organizer info if needed
        // dto.setOrganizerId(event.getOrganizer().getId());
        // dto.setOrganizerName(event.getOrganizer().getName());
        // Consider adding roles if needed
        // dto.setRoles(event.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        // Consider adding other fields if needed
        // dto.setCreatedAt(event.getCreatedAt());
        // dto.setUpdatedAt(event.getUpdatedAt());
        // Consider adding other relationships if needed
        // dto.setOtherField(event.getOtherField());
        if (event.getOrganizer() != null) {
            dto.setOrganizerId(event.getOrganizer().getId());
            dto.setOrganizerName(event.getOrganizer().getName()); // Or username
        }
        return dto;
    }














private VolunteerSummaryDto mapVolunteerToSummaryDto(Volunteer volunteer) {
        if (volunteer == null) {
            return null;
        }
        VolunteerSummaryDto summary = new VolunteerSummaryDto();
        summary.setId(volunteer.getId());
        summary.setPhoneNumber(volunteer.getPhoneNumber());
        summary.setSkills(volunteer.getSkills());
        summary.setAvailability(volunteer.getAvailability());

        // Get name and email from the associated User
        User associatedUser = volunteer.getUser();
        if (associatedUser != null) {
            summary.setName(associatedUser.getName());
            summary.setEmail(associatedUser.getEmail());
        } else {
            // Handle cases where user might be null (shouldn't happen with proper setup)
            summary.setName("N/A");
            summary.setEmail("N/A");
        }
        return summary;
    }
















    private Event mapToEntity(EventDto dto) {
        Event event = new Event();
        // Don't set ID for creation
        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setLocation(dto.getLocation());
        event.setStartDateTime(dto.getStartDateTime());
        event.setEndDateTime(dto.getEndDateTime());
        event.setSlotsAvailable(dto.getSlotsAvailable());
        // Volunteer assignment handled separately
        return event;
    }
    // --- End Mappers ---

    public List<EventDto> getAllEvents() {
        return eventRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public EventDto getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        return mapToDto(event);
    }

    public EventDto createEvent(EventDto eventDto, User organizer) { // Accept User object
        Event event = new Event();
        // Map fields from eventDto to event entity...
        event.setName(eventDto.getName());
        event.setDescription(eventDto.getDescription());
        event.setLocation(eventDto.getLocation());
        event.setStartDateTime(eventDto.getStartDateTime());
        event.setEndDateTime(eventDto.getEndDateTime());
        event.setSlotsAvailable(eventDto.getSlotsAvailable());
        
        // ... etc ...
    
        event.setOrganizer(organizer); // Set the organizer using the passed User object
    
        Event savedEvent = eventRepository.save(event);
    
        // Map savedEvent back to EventDto to return
        return mapToDto(savedEvent); // Assuming you have a mapping method
    }






























    // public EventDto createEvent(EventDto eventDto,User currentUser) {
    //     // Add validation: End date must be after start date
    //     if (eventDto.getEndDateTime().isBefore(eventDto.getStartDateTime())) {
    //          throw new ApiException(HttpStatus.BAD_REQUEST, "End date/time must be after start date/time");
    //     }
    //     Event event = mapToEntity(eventDto);
    //     event.setOrganizer(currentUser); // Associate the logged-in user

    // Event savedEvent = eventRepository.save(event);
    // return mapToDto(savedEvent);
            
    // }
    public EventDto createEvent(EventDto eventDto) {
        // Add validation: End date must be after start date
        if (eventDto.getEndDateTime().isBefore(eventDto.getStartDateTime())) {
             throw new ApiException(HttpStatus.BAD_REQUEST, "End date/time must be after start date/time");
        }
        Event event = mapToEntity(eventDto);
        // Associate the logged-in user

    Event savedEvent = eventRepository.save(event);
    return mapToDto(savedEvent);
            
    }
    public EventDto updateEvent(Long id, EventDto eventDto) {
        // Fetch the existing event
        // Consider using a method to check if the user is authorized to update this event
        // Optional: Check if the user is authorized to update this event
        // Optional: Check if the user is the organizer of this event
        // Optional: Check if the user has the required role to update this event
        // Optional: Check if the user has the required role to update this event
        
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        // Optional: Check if the user is the organizer of this event


        // Add validation: End date must be after start date
        if (eventDto.getEndDateTime().isBefore(eventDto.getStartDateTime())) {
             throw new ApiException(HttpStatus.BAD_REQUEST, "End date/time must be after start date/time");
        }
        // Update fields


        existingEvent.setName(eventDto.getName());
        existingEvent.setDescription(eventDto.getDescription());
        existingEvent.setLocation(eventDto.getLocation());
        existingEvent.setStartDateTime(eventDto.getStartDateTime());
        existingEvent.setEndDateTime(eventDto.getEndDateTime());
        existingEvent.setSlotsAvailable(eventDto.getSlotsAvailable());
        // Optional: Handle volunteer assignments if needed
        // Optional: Handle roles if needed


        Event updatedEvent = eventRepository.save(existingEvent);
        return mapToDto(updatedEvent);
    }

    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        // Consider handling related data (e.g., unassign volunteers) before deleting if necessary
        eventRepository.delete(event);
    }

    // --- Volunteer Assignment Logic (Example) ---
    @Transactional
    public EventDto assignVolunteerToEvent(Long eventId, Long volunteerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                 .orElseThrow(() -> new ResourceNotFoundException("Volunteer", "id", volunteerId));

        // Optional: Check if slots are available
        if (event.getSlotsAvailable() != null && event.getAssignedVolunteers().size() >= event.getSlotsAvailable()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No more slots available for this event.");
        }

        event.getAssignedVolunteers().add(volunteer);
        // volunteer.getAssignedEvents().add(event); // Managed by the owning side (Event)

        eventRepository.save(event);
        return mapToDto(event);
    }

     @Transactional
    public EventDto unassignVolunteerFromEvent(Long eventId, Long volunteerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                 .orElseThrow(() -> new ResourceNotFoundException("Volunteer", "id", volunteerId));

        event.getAssignedVolunteers().remove(volunteer);
        // volunteer.getAssignedEvents().remove(event);

        eventRepository.save(event);
        return mapToDto(event);
    }
    // Inside EventService
public List<EventDto> getEventsOrganizedByCurrentUser(User currentUser) {
    // Assuming User entity has a collection of organized events mapped by 'organizer' field in Event
    // List<Event> events = eventRepository.findByOrganizerId(currentUser.getId()); // If you add such a query method
    // Or leverage the relationship if mapped correctly (may need adjustments in User entity)
     List<Event> events = eventRepository.findByOrganizer(currentUser); // Simpler if relationship setup allows
    return events.stream().map(this::mapToDto).collect(Collectors.toList());
}

// Or with pagination
 public Page<EventDto> getEventsOrganizedByCurrentUser(User currentUser, Pageable pageable) {
     Page<Event> eventsPage = eventRepository.findByOrganizer(currentUser, pageable);
     return eventsPage.map(this::mapToDto); // map Page content using the DTO mapper
 }
}