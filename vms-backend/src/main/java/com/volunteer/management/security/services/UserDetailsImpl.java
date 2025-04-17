package com.volunteer.management.security.services; // Or your preferred package

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.volunteer.management.entity.User; // Import your User entity
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class UserDetailsImpl implements UserDetails {

    @Serial
    private static final long serialVersionUID = 1L; // Recommended for Serializable classes

    // --- Custom fields from your User entity ---
    private final Long id;
    private final String username;
    private final String email;

    // --- Fields required by UserDetails ---
    @JsonIgnore // Prevent password from being serialized accidentally
    private final String password;

    // Store roles/permissions
    private final Collection<? extends GrantedAuthority> authorities;

    // --- Constructor ---
    // Takes required fields to build the UserDetails object
    public UserDetailsImpl(Long id, String username, String email, String password,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    // --- Static Factory Method (Recommended) ---
    // Takes your User entity and creates a UserDetailsImpl instance
    public static UserDetailsImpl build(User user) {
        // Convert your User entity's Roles into Spring Security's GrantedAuthority objects
        List<GrantedAuthority> authorities = user.getRoles().stream()
                // Assuming your Role entity has a getName() method returning an Enum or String
                // If Role has an Enum 'name': .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                // If Role has a String 'name': .map(role -> new SimpleGrantedAuthority(role.getName()))
                .map(role -> new SimpleGrantedAuthority(role.getName())) // Adjust based on your Role entity
                .collect(Collectors.toList());

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(), // The encoded password from your User entity
                authorities);
    }

    // --- UserDetails Interface Methods Implementation ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        // Return the field Spring Security should use for authentication (often username or email)
        return username;
    }

    // --- Account Status Methods ---
    // Implement these based on fields in your User entity if you have them
    // Otherwise, return true if the features aren't used.

    @Override
    public boolean isAccountNonExpired() {
        // Return true unless you have specific logic for account expiration
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // Return true unless you implement account locking
        // Example if User has boolean isLocked: return !user.isLocked();
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // Return true unless you implement password expiration
        return true;
    }

    @Override
    public boolean isEnabled() {
        // Return true unless you implement account disabling
        // Example if User has boolean isEnabled: return user.isEnabled();
        return true;
    }

    // --- Custom Getters ---
    // Provide getters for your custom fields (id, email)

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    // --- equals() and hashCode() ---
    // Important for comparing UserDetails instances, often based on ID

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl that = (UserDetailsImpl) o;
        return Objects.equals(id, that.id); // Primarily compare by unique ID
    }

    @Override
    public int hashCode() {
        return Objects.hash(id); // Hash based on ID
    }
}