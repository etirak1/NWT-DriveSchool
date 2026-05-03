package com.autoskola.userservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @NotBlank(message = "Ime je obavezno")
    private String firstName;
    @NotBlank(message = "Prezime je obavezno")
    private String lastName;

    @Column(unique = true)
    @Email(message = "Email mora biti u ispravnom formatu")
    @NotBlank(message = "Email je obavezan")
    private String email;
    @Size(min = 6, message = "Lozinka mora imati barem 6 karaktera")
    private String passwordHash;
    private String role;
    private String status;
    private LocalDateTime dateCreated;

    @PrePersist
    protected void onCreate() { dateCreated = LocalDateTime.now(); }
}