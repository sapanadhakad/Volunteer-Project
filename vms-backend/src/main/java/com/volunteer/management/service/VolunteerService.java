package com.volunteer.management.service;

import com.volunteer.management.dto.VolunteerDetailsDto;
import com.volunteer.management.dto.VolunteerDto;
import com.volunteer.management.dto.VolunteerProfileDto;
import com.volunteer.management.entity.User;
import com.volunteer.management.entity.Volunteer;
import com.volunteer.management.exception.ResourceNotFoundException;
import com.volunteer.management.repository.UserRepository;
import com.volunteer.management.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor; // Lombok: Generates constructor for final fields
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Ensure atomicity

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Use constructor injection (preferred over @Autowired field injection)
@Transactional // Good practice to have transactions at the service layer boundary
public class VolunteerService {

    private final VolunteerRepository volunteerRepository;
    // Consider adding a Mapper component (e.g., using MapStruct) for complex mapping
 private final UserRepository userRepository; 
    // --- Mapping Logic (Simple Manual Example) ---
    private VolunteerDto mapToDto(Volunteer volunteer) {
        return new VolunteerDto(
                volunteer.getId(),
                volunteer.getPhoneNumber(),
                volunteer.getSkills(),
                volunteer.getAvailability()
                // volunteer.getName(),
                // volunteer.getEmail(),
                
        );
    }

    private Volunteer mapToEntity(VolunteerDto volunteerDto) {
        Volunteer volunteer = new Volunteer();
        // ID is typically generated, don't set it from DTO for creation
        // volunteer.setName(volunteerDto.getName());
        // volunteer.setEmail(volunteerDto.getEmail());
        volunteer.setPhoneNumber(volunteerDto.getPhoneNumber());
        volunteer.setSkills(volunteerDto.getSkills());
        volunteer.setAvailability(volunteerDto.getAvailability());
        return volunteer;
    }
    // --- End Mapping Logic ---

    public List<VolunteerDto> getAllVolunteers() {
        return volunteerRepository.findAll()
                .stream()
                .map(this::mapToDto) // Use method reference
                .collect(Collectors.toList());
    }

    public VolunteerDto getVolunteerById(Long id) {
        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer", "id", id));
        return mapToDto(volunteer);
    }

    public VolunteerDto createVolunteer(VolunteerDto volunteerDto) {
        // Optional: Add check if email already exists
        // volunteerRepository.findByEmail(volunteerDto.getEmail()).ifPresent(v -> {
        //    throw new SomeCustomException("Email already exists");
        // });

        Volunteer volunteer = mapToEntity(volunteerDto);
        Volunteer savedVolunteer = volunteerRepository.save(volunteer);
        return mapToDto(savedVolunteer);
    }

    public VolunteerDto updateVolunteer(Long id, VolunteerDto volunteerDto) {
        Volunteer existingVolunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer", "id", id));

        // Update fields from DTO
        // existingVolunteer.setName(volunteerDto.getName());
        // existingVolunteer.setEmail(volunteerDto.getEmail()); // Consider implications of changing unique fields
        existingVolunteer.setPhoneNumber(volunteerDto.getPhoneNumber());
        existingVolunteer.setSkills(volunteerDto.getSkills());
        existingVolunteer.setAvailability(volunteerDto.getAvailability());

        Volunteer updatedVolunteer = volunteerRepository.save(existingVolunteer);
        return mapToDto(updatedVolunteer);
    }

    public void deleteVolunteer(Long id) {
        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer", "id", id));
        volunteerRepository.delete(volunteer);
    }
    // private VolunteerProfileDto mapToProfileDto(Volunteer volunteer) {
    //     User user = volunteer.getUser(); // Assumes eager fetch or within transaction
    //     return new VolunteerProfileDto(
    //             volunteer.getId(),
    //             user.getId(),
    //             user.getName(), // Get from linked user
    //             user.getEmail(), // Get from linked user
    //             volunteer.getPhoneNumber(),
    //             volunteer.getAvailability(),
    //             volunteer.getSkills()
    //     );
    // }

     // Get Volunteer Profile DTO by User ID
    public VolunteerProfileDto getVolunteerProfileByUserId(Long userId) {
        Volunteer volunteer = volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer Profile", "userId", userId));
        // Ensure user is loaded if lazy fetching
         // Hibernate.initialize(volunteer.getUser()); // If needed and lazy
        return mapToProfileDto(volunteer);
    }

    // Create or Update Volunteer Details for a given User ID
    public VolunteerProfileDto createOrUpdateVolunteerDetails(Long userId, VolunteerDetailsDto detailsDto) {
        // 1. Find the User first - ensures the user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 2. Find existing volunteer profile or create a new one
        Volunteer volunteer = volunteerRepository.findByUserId(userId)
            .orElseGet(() -> {
                Volunteer newVolunteer = new Volunteer();
                newVolunteer.setUser(user); // Link to the user
                return newVolunteer;
            });

        // 3. Update the details
        volunteer.setPhoneNumber(detailsDto.getPhoneNumber());
        volunteer.setAvailability(detailsDto.getAvailability());
        volunteer.setSkills(detailsDto.getSkills());

        // 4. Save the volunteer record (either new or updated)
        Volunteer savedVolunteer = volunteerRepository.save(volunteer);

        // 5. Return the DTO representation
        return mapToProfileDto(savedVolunteer);
    }
// Inside VolunteerService.java
private VolunteerProfileDto mapToProfileDto(Volunteer volunteer) {
    User user = volunteer.getUser(); // Get the linked user
    // Ensure user is not null (add check if needed, though JoinColumn nullable=false helps)
    if (user == null) {
         // Handle this case - maybe throw an exception? Should not happen with nullable=false
         throw new IllegalStateException("Volunteer record " + volunteer.getId() + " is not linked to a User.");
    }
    return new VolunteerProfileDto(
            volunteer.getId(),
            user.getId(),
            user.getName(), // <<< Get from user
            user.getEmail(), // <<< Get from user
            volunteer.getPhoneNumber(),
            volunteer.getAvailability(),
            volunteer.getSkills()
    );
}

// The createOrUpdateVolunteerDetails method no longer needs to worry about setting
// name/email on the Volunteer object itself. Just set phone, skills, availability, and user link.
     // Keep existing methods if they serve other purposes, but adjust DTOs/mapping
    // public VolunteerDto getVolunteerById(Long id) { ... } -> Maybe return VolunteerProfileDto?
    // public void deleteVolunteer(Long id) { ... } // Be careful, deleting volunteer might leave user orphaned? Or cascade?
}