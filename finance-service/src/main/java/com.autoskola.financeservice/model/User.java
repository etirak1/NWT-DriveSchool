package com.autoskola.financeservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users") // "user" je rezervisana reč u SQL-u, zato koristimo "users"
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private String firstName;
    private String lastName;
    private String email;
    private String passwordHash;
    private String role;
    private String status;
    private LocalDateTime dateCreated;
}