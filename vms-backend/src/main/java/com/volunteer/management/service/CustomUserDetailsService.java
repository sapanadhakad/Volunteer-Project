// package com.volunteer.management.service;

// import com.volunteer.management.entity.User;
// import com.volunteer.management.repository.UserRepository;
// import lombok.RequiredArgsConstructor;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// @Service
// @RequiredArgsConstructor
// public class CustomUserDetailsService implements UserDetailsService {

//     private final UserRepository userRepository;

//     @Override
//     @Transactional(readOnly = true) // Good practice for read operations
//     public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
//         // Try finding user by username or email
//         User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
//                 .orElseThrow(() ->
//                         new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail));

//         // The User entity implements UserDetails, so we can return it directly
//         // Spring Security will use the getAuthorities(), getPassword(), etc. methods we defined
//         return user;
//     }
// }