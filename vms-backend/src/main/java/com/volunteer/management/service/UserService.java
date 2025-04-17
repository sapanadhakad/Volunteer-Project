// src/main/java/com/volunteer/management/service/UserService.java
package com.volunteer.management.service;

import com.volunteer.management.dto.UserProfileUpdateDto;
import com.volunteer.management.entity.User;
import com.volunteer.management.exception.EmailAlreadyExistsException;
import com.volunteer.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;
import java.util.Objects; // Import for Objects.equals

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Find by username (used for getting current profile via Authentication)
    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username) // Assumes findByUsername exists in repo
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    // Update user profile based on username
    @Transactional
    public User updateUserProfile(String currentUsername, @Valid UserProfileUpdateDto updateDto) {
        User userToUpdate = findUserByUsername(currentUsername);

        // --- Handle Potential Email Change ---
        // Check if email in DTO is different from current email *and* if it already exists
        if (!Objects.equals(userToUpdate.getEmail(), updateDto.getEmail())) {
            if (userRepository.existsByEmail(updateDto.getEmail())) { // Assumes existsByEmail in repo
                throw new EmailAlreadyExistsException("Email address " + updateDto.getEmail() + " is already in use.");
            }
            // Update email if it's different and available
            userToUpdate.setEmail(updateDto.getEmail());
            // Consider adding email verification logic here if required
        }
        // --- End Email Change Handling ---

        // Update other allowed fields
        userToUpdate.setName(updateDto.getName());

        // Save the updated user entity
        return userRepository.save(userToUpdate);
    }


    
    public User findUserById(Long id) {
        return userRepository.findById(id) // Assumes standard JpaRepository findById
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + id));
                // Or a different/more generic exception like UserNotFoundException(id)
    }

    // --- Other service methods ---

}