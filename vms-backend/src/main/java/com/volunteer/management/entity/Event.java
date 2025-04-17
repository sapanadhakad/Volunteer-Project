package com.volunteer.management.entity;

import jakarta.persistence.*;
import lombok.Data; // Be mindful of @Data on Entities (see notes below)
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

// Import Jackson annotations
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference; // Import if User entity needs it

@Entity
@Table(name = "events")
@Data // Includes @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor
@NoArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String location;

    @Column(nullable = false)
    private LocalDateTime startDateTime;

    @Column(nullable = false)
    private LocalDateTime endDateTime;

    private Integer slotsAvailable;

    // --- Event <-> Volunteer Relationship (Owning Side) ---
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "event_volunteers",
            joinColumns = @JoinColumn(name = "event_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "volunteer_id", referencedColumnName = "id"))
    @ToString.Exclude // Good practice with Lombok @Data
    @EqualsAndHashCode.Exclude // Good practice with Lombok @Data
    @JsonManagedReference("event-volunteer") // Mark as the "forward" part for serialization
    private Set<Volunteer> assignedVolunteers = new HashSet<>();


    // --- Event <-> User (Organizer) Relationship ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_user_id", nullable = false)
    // @JsonIgnoreProperties is a valid alternative to break cycles/limit data from User
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "assignedEvents", "volunteer", "roles", "password"}) // Add more fields from User to ignore if needed
    @ToString.Exclude // Good practice with Lombok @Data
    @EqualsAndHashCode.Exclude // Good practice with Lombok @Data
    private User organizer;

    // NOTE on @Data: While convenient, @Data on JPA entities can sometimes cause issues,
    // especially with default equals/hashCode implementations involving lazy relationships
    // or mutable state. Using @Getter, @Setter and manually implementing safe
    // equals/hashCode (like in Volunteer) or using @EqualsAndHashCode(onlyExplicitlyIncluded = true)
    // is often safer. Your use of Exclude helps mitigate this.

    // Commented code removed for clarity...
}