package com.volunteer.management.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
   
    private Long id;

    @Column(length = 60, unique = true, nullable = false)
    private String name; // e.g., ROLE_ADMIN, ROLE_VOLUNTEER


    public Role(String name) {
        this.name = name;
    }
    
}