package com.volunteer.management.config;

import com.volunteer.management.entity.Role;
import com.volunteer.management.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if roles already exist to avoid duplicates
        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            roleRepository.save(new Role("ROLE_ADMIN"));
        }
        if (roleRepository.findByName("ROLE_VOLUNTEER").isEmpty()) {
            roleRepository.save(new Role("ROLE_VOLUNTEER"));
        }
        if (roleRepository.findByName("ROLE_ORGANIZER").isEmpty()) {
            roleRepository.save(new Role("ROLE_ORGANIZER"));
            System.out.println(">>> Created ROLE_ORGANIZER");
        }
// if (roleRepository.findByName("ROLE_ORGANIZER").isEmpty()) {
//             roleRepository.save(new Role("ROLE_ORGANIZER"));
//             System.out.println(">>> Created ROLE_ORGANIZER");
//         }        

        // Add other initial data if needed
    }
}