package com.volunteer.management.entity;

import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

// Import Jackson annotations
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference; // Import if User entity needs it

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "volunteers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // Keep if you have a constructor needing all fields
public class Volunteer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 20)
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String availability;

    // --- Volunteer <-> User Relationship ---
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
    @JsonBackReference("user-volunteer") // Use unique names if multiple relationships exist
    private User user;

    // --- Volunteer <-> Event Relationship (Inverse Side) ---
    @ManyToMany(mappedBy = "assignedVolunteers", fetch = FetchType.LAZY)
    @JsonBackReference("event-volunteer") // Mark as the "back" part of the relationship
    private Set<Event> assignedEvents = new HashSet<>();

    // --- Safe equals() and hashCode() based ONLY on ID ---
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        // Use instanceof check for proxy safety if using Hibernate/JPA extensively
        if (!(o instanceof Volunteer volunteer)) return false;
        // Only compare ID, handle null ID for transient entities
        return id != null && id.equals(volunteer.id);
    }

    @Override
    public int hashCode() {
        // Use a constant for transient entities, or hash the ID if persistent
        return id != null ? Objects.hash(id) : getClass().hashCode();
        // Or simply: return getClass().hashCode(); // Simpler, safer with ORMs
    }

    // --- Safe toString() excluding relationships ---
    @Override
    public String toString() {
        return "Volunteer{" +
               "id=" + id +
               ", phoneNumber='" + phoneNumber + '\'' +
               ", skills='" + skills + '\'' +
               ", availability='" + availability + '\'' +
               // DO NOT include 'user' or 'assignedEvents' here to avoid loops/lazy loading issues
               '}';
    }
}