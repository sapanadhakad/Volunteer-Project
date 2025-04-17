package com.volunteer.management.config;

import org.springframework.beans.factory.annotation.Autowired;
// ... other imports ...
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import com.volunteer.management.security.services.UserDetailsServiceImpl;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

// ... other imports needed for your SecurityConfig ...
import java.util.Arrays;
import java.util.List;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity // If you use @PreAuthorize
@RequiredArgsConstructor
@EnableWebMvc
public class SecurityConfig {
@Autowired
    private UserDetailsServiceImpl userDetailsServiceImpl; // Inject the specific implementation

   

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    // private static final String[] SWAGGER_WHITELIST = {
    //     "/swagger-ui/**",
    //     "/v3/api-docs/**", // Includes /v3/api-docs, /v3/api-docs.yaml, etc.
    //     "/swagger-ui.html"
    //     // Add others if needed, e.g., /swagger-resources/** (less common now)
    // };

    // ... (PasswordEncoder, AuthenticationManager beans etc.) ...
    @Bean
    public static PasswordEncoder passwordEncoder() { // Example bean
        return new BCryptPasswordEncoder();
    }

     @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception { // Example bean

        return configuration.getAuthenticationManager();
    }

    // --- THIS IS THE CRITICAL PART FOR CORS ---
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // *** Make sure your Angular app's origin is listed here ***
        configuration.setAllowedOrigins(List.of("http://localhost:4200")); // Must match exactly!
        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        // Allow common headers, especially Authorization for JWT and Content-Type
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type", "Accept", "Origin"));
        // If you might need to expose headers to the frontend (e.g., custom headers), list them here
        configuration.setExposedHeaders(Arrays.asList("Authorization")); // Example if needed
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true); // Often needed if you send Authorization headers

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths ("/**")
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    // --- END OF CRITICAL CORS PART ---
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Apply the CORS configuration defined in the corsConfigurationSource bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ... (rest of your security config: csrf, sessionManagement, exceptionHandling, authorizeHttpRequests, addFilterBefore) ...

             .csrf(csrf -> csrf.disable())
             .exceptionHandling(exceptions -> exceptions
                 .authenticationEntryPoint(authenticationEntryPoint()) // Your custom 401 handler
             )
             .sessionManagement(session -> session
                 .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
             )
             .authorizeHttpRequests(auth -> auth
                 .requestMatchers("/api/auth/**").permitAll()
                 .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                 .requestMatchers(HttpMethod.GET, "/api/volunteers/**").permitAll()
                 .requestMatchers("/api/users/me").authenticated()
                //  .requestMatchers((SWAGGER_WHITELIST)).permitAll() 
                 .requestMatchers(
                 "/swagger-ui.html",
                 "/swagger-ui/**",
                 "/v3/api-docs/**", // Or /api-docs/** for springfox
                 "/webjars/**"
                 // Add any other related paths if customized
             ).permitAll()
                 .anyRequest().authenticated()
             )
             .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);


        return http.build();
    }

     // --- Your other beans like AuthenticationEntryPoint ---
      @Bean
      public AuthenticationEntryPoint authenticationEntryPoint() { // Example bean
          return (request, response, authException) -> {
              response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
              response.setContentType("application/json");
              response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" + authException.getMessage() + "\"}");
          };
      }
      public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        // Set your custom UserDetailsService and PasswordEncoder
        authProvider.setUserDetailsService(userDetailsServiceImpl); // <-- Use the @Autowired field
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

}