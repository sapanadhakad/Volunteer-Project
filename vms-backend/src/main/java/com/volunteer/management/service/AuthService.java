package com.volunteer.management.service;

import com.volunteer.management.config.JwtTokenProvider;
import com.volunteer.management.dto.JwtAuthResponse;
import com.volunteer.management.dto.LoginRequest;
import com.volunteer.management.dto.RegisterRequest;
import com.volunteer.management.dto.UserDto;
import com.volunteer.management.entity.Role;
import com.volunteer.management.entity.User;
import com.volunteer.management.exception.ApiException; // Reuse existing exception
import com.volunteer.management.repository.RoleRepository;
import com.volunteer.management.repository.UserRepository;
import com.volunteer.management.security.services.UserDetailsImpl; // Assuming this is your UserDetails implementation

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
// Import UsernameNotFoundException if you plan to use it elsewhere, but it's removed from the login flow here
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Keep for register

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class); // Add Logger

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Authenticates a user and generates a JWT token along with user details.
     * Note: A StackOverflowError during login often originates *within* the
     * authenticationManager.authenticate call, typically due to issues in
     * UserDetailsService, User/Role entity relationships, or their toString/equals/hashCode methods.
     * Check the full stack trace for the repeating method calls.
     *
     * @param loginRequest The login credentials.
     * @return JwtAuthResponse containing the token and user DTO.
     */
    public JwtAuthResponse login(LoginRequest loginRequest) {
        log.info("Attempting login for user: {}", loginRequest.getUsernameOrEmail()); // Add logging

        Authentication authentication;
        try {
            // 1. Authenticate using Spring Security's AuthenticationManager
            // This is where UserDetailsService is called internally.
            // A StackOverflowError is likely to occur within this call if there's recursion.
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()
                    )
            );
            log.debug("Authentication successful for user: {}", loginRequest.getUsernameOrEmail());

        } catch (Exception e) {
            log.error("Authentication failed for user: {}", loginRequest.getUsernameOrEmail(), e);
            // Re-throw or handle specific authentication exceptions appropriately
            // Example: throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            throw e; // Re-throw original exception for now
        }

        // 2. If authentication successful, set it in the SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);
        log.debug("Security context updated for user: {}", loginRequest.getUsernameOrEmail());

        // 3. Generate JWT token
        String token = jwtTokenProvider.generateToken(authentication);
        log.debug("JWT token generated for user: {}", loginRequest.getUsernameOrEmail());

        // 4. Extract user details from the Authentication Principal
        // We assume the principal is an instance of UserDetailsImpl
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // 5. Create UserDto from UserDetailsImpl (avoids hitting DB again)
        UserDto userDto = new UserDto();
        userDto.setId(userDetails.getId());
        // userDto.setName(userDetails.getName()); // Uncomment and implement if UserDetailsImpl has the 'name' field
        userDto.setUsername(userDetails.getUsername());
        userDto.setEmail(userDetails.getEmail());

        // Get roles directly from authorities in UserDetailsImpl
        Set<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority) // Get role name as string (e.g., "ROLE_USER")
                .collect(Collectors.toSet());
        userDto.setRoles(roles);

        // --- Removed the redundant user fetch block here ---
        // The User entity was fetched again from the DB but wasn't used.
        // The necessary info (ID, username, email, roles) is already in UserDetailsImpl.
        // If the StackOverflowError was related to this specific fetch triggering
        // something problematic (like a toString() on the entity), removing it helps.
        // However, the root cause is more likely during the authenticationManager.authenticate step.

        log.info("Login successful, returning token and UserDto for user: {}", userDetails.getUsername());
        // 6. Return the response containing the token and user DTO
        return new JwtAuthResponse(token, userDto);
    }


    @Transactional // Registration should be transactional
    public String register(RegisterRequest registerRequest) {
        log.info("Attempting registration for username: {}", registerRequest.getUsername());

        // Check if username exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            log.warn("Registration failed: Username '{}' is already taken.", registerRequest.getUsername());
            throw new ApiException(HttpStatus.BAD_REQUEST, "Username is already taken!");
        }

        // Check if email exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            log.warn("Registration failed: Email '{}' is already registered.", registerRequest.getEmail());
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is already registered!");
        }

        // Create new user object
        User user = new User();
        user.setName(registerRequest.getName());
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword())); // Encode password

        // Assign role(s)
        Set<Role> roles = new HashSet<>();
        // Assuming RegisterRequest has a field like 'roleName' or similar
        // Make sure the role name provided (e.g., "ROLE_VOLUNTEER", "ROLE_ORGANIZER") exists in your DB.
        String requestedRoleName = registerRequest.getRoleName(); // Or get role differently if needed
        if (requestedRoleName == null || requestedRoleName.trim().isEmpty()){
             log.error("Registration failed: Role name not provided for user '{}'", registerRequest.getUsername());
            throw new ApiException(HttpStatus.BAD_REQUEST, "Role name must be provided for registration.");
        }

        Role userRole = roleRepository.findByName(requestedRoleName)
                .orElseThrow(() -> {
                    log.error("Registration failed: Role '{}' not found in database.", requestedRoleName);
                    return new ApiException(HttpStatus.BAD_REQUEST, "Error: Specified role not found.");
                });

        roles.add(userRole);
        user.setRoles(roles);

        // Save user to database
        userRepository.save(user);
        log.info("User '{}' registered successfully with role '{}'.", user.getUsername(), requestedRoleName);


        // Optional: Create related profile if needed (e.g., Volunteer profile)
        // ...

        return "User registered successfully!";
    }
}