package com.volunteer.management.dto;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;
import java.util.stream.Collectors;

import com.volunteer.management.entity.Role;
import com.volunteer.management.entity.User;
@NoArgsConstructor
@Getter
@Setter

public class UserDto {
    private Long id;
    private String name;
    private String username;
    private String email;
    private Set<String> roles; // Send role names, not full Role objects
    public UserDto(User user) { // Example mapping constructor
        this.id = user.getId();
        this.name = user.getName();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.roles = user.getRoles().stream()
                           .map(Role::getName)
                           .collect(Collectors.toSet());
    }
    
}
