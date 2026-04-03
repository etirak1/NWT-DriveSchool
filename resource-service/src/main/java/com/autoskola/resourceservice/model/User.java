package com.autoskola.resourceservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String firstName;
    private String lastName;
    @Column(unique = true)
    private String email;
    private String passwordHash;
    private String role;  // ADMIN, INSTRUCTOR, CANDIDATE
    private String status;
    private LocalDateTime dateCreated;

    @PrePersist
    protected void onCreate() { dateCreated = LocalDateTime.now(); }
}