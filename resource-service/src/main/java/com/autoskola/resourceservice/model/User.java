package com.autoskola.resourceservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id
    private Long userId;

    @NotBlank(message = "Ime je obavezno")
    @Size(min = 2, max = 50, message = "Ime mora imati između 2 i 50 karaktera")
    private String firstName;

    @NotBlank(message = "Prezime je obavezno")
    @Size(min = 2, max = 50, message = "Prezime mora imati između 2 i 50 karaktera")
    private String lastName;

    @NotBlank(message = "Email je obavezan")
    @Email(message = "Email mora biti u ispravnom formatu")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Lozinka je obavezna")
    @Size(min = 6, message = "Lozinka mora imati najmanje 6 karaktera")
    private String passwordHash;

    @NotBlank(message = "Uloga je obavezna")
    private String role;  // ADMIN, INSTRUCTOR, CANDIDATE

    @NotBlank(message = "Status je obavezan")
    private String status;

    private LocalDateTime dateCreated;

    @PrePersist
    protected void onCreate() { dateCreated = LocalDateTime.now();
    }
}