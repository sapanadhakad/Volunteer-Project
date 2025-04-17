package com.volunteer.management.dto;

import lombok.Getter;
import lombok.Setter;
// Or use @Data if you want getters, setters, toString, equals/hashCode, requiredArgsConstructor
@Getter
@Setter // Add Setter if you need to modify instances after creation, otherwise Getter might be enough
public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private UserDto user; // Ensure UserDto is also serializable (has getters or Lombok annotations)

    // Constructors remain the same (or use Lombok's @AllArgsConstructor / @RequiredArgsConstructor if preferred)
    public JwtAuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }

    public JwtAuthResponse(String accessToken, UserDto user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    public JwtAuthResponse(String accessToken, String tokenType, UserDto user) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.user = user;
    }

    // No need for manual getters/setters if using Lombok annotations
}