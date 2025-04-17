package com.volunteer.management.config;

import com.volunteer.management.exception.ApiException; // Create this simple exception class
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException; // Import specifically
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationDate;

    // Generate JWT token
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(currentDate)
                .setExpiration(expireDate)
                .signWith(key()) // Use Key for signing
                .compact();
    }

    // Get username from Jwt token
    public String getUsername(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    // Validate Jwt token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
            // throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid JWT token"); // Optional: Throw specific exception
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token: {}", ex.getMessage());
            // throw new ApiException(HttpStatus.UNAUTHORIZED, "Expired JWT token");
        } catch (UnsupportedJwtException ex) {
             logger.error("Unsupported JWT token: {}", ex.getMessage());
            // throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
             logger.error("JWT claims string is empty: {}", ex.getMessage());
            // throw new ApiException(HttpStatus.BAD_REQUEST, "JWT claims string is empty.");
        } catch (SignatureException ex) {
             logger.error("JWT signature does not match locally computed signature: {}", ex.getMessage());
             // throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid JWT signature.");
        }
        return false; // Return false if any exception occurs
    }


    // Generate Key object from secret string
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }
}

// Create a simple ApiException class if you want to throw specific exceptions
// exception/ApiException.java
