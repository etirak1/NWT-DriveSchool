package com.autoskola.resourceservice.event;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserRegisteredEvent {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
}