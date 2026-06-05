package com.autoskola.userservice.dto;

import lombok.Data;

@Data // Ako koristiš Lombok, on će sam napraviti gettere i settere
public class UserCreatedEvent {
    private Integer userId;
    private String email;
    private String firstName;
    private String lastName;
}