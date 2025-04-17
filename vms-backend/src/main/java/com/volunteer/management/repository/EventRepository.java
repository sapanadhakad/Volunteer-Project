package com.volunteer.management.repository;
import com.volunteer.management.entity.Event;
import com.volunteer.management.entity.User;
import com.volunteer.management.entity.Volunteer;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EventRepository extends JpaRepository<Event, Long> {
    // Add custom queries if needed, e.g., find by date range
    List<Event> findByOrganizer(User organizer);

    Page<Event> findByOrganizer(User currentUser, Pageable pageable);

    List<Event> findByAssignedVolunteersContains(Volunteer currentVolunteer);
}