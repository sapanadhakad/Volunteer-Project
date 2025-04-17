// src/main/java/com/volunteer/management/service/EventSecurityService.java
package com.volunteer.management.service;

import com.volunteer.management.entity.Event;
import com.volunteer.management.entity.User;
import com.volunteer.management.repository.EventRepository;
import com.volunteer.management.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service("eventSecurityService") // Bean name used in @PreAuthorize
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventSecurityService {

    private final EventRepository eventRepository;
    // private final AuthService authService; // Or directly use SecurityContextHolder
private final UserRepository userRepository;
    // Checks if the current user is the organizer of the specified event OR an Admin
    public boolean isOrganizerOrAdmin(Long eventId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // Allow ADMINs full access
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }

        // Check if the current user is the organizer
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event == null || event.getOrganizer() == null) {
            return false; // Event not found or no organizer set (shouldn't happen if nullable=false)
        }

        // Assuming principal is UserDetails (like our User entity) or just username string
        Object principal = authentication.getPrincipal();
        Long currentUserId;
        if (principal instanceof User userDetails) {
             currentUserId = userDetails.getId();
        } else if (principal instanceof String username) {
             // Need to fetch user ID based on username if Principal is just String
             User currentUser = userRepository.findByUsername((String)principal)
                  .orElseThrow(() -> new RuntimeException("Current user not found"));
             currentUserId = currentUser.getId();
        } else {
            return false; // Unknown principal type
        }


        return event.getOrganizer().getId().equals(currentUserId);
    }
}