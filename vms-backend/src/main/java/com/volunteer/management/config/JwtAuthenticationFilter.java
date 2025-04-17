package com.volunteer.management.config;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import com.volunteer.management.security.services.UserDetailsServiceImpl;


import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService; // Use Spring's interface








    // Constructor Injection
    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, UserDetailsServiceImpl userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Get JWT token from http request (Authorization header)
        String token = getTokenFromRequest(request);

        // 2. Validate token using JwtTokenProvider
        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            // 3. Get username from token
            String username = jwtTokenProvider.getUsername(token);

            // 4. Load the user associated with the token (from database)
            UserDetails userDetails = userDetailsService.loadUserByUsername(username); // Throws UsernameNotFoundException if not found

            // 5. Create Authentication object
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null, // Credentials - not needed for JWT
                    userDetails.getAuthorities()
            );

            // 6. Set details
            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // 7. Set the authentication object in Spring Security's context
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }


    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // Return token string (remove "Bearer ")
            return bearerToken.substring(7);
        }
        return null;
    }
}