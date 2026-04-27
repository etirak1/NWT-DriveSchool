package com.autoskola.financeservice.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Integer userId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
}