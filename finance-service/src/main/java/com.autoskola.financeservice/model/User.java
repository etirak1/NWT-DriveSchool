package com.autoskola.financeservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    @NotBlank(message = "Ime je obavezno")
    @Size(max = 50, message = "Ime ne može biti duže od 50 karaktera")
    private String firstName;

    @NotBlank(message = "Prezime je obavezno")
    private String lastName;

    @Email(message = "Email format nije validan")
    @NotBlank(message = "Email je obavezan")
    private String email;

    @NotBlank(message = "Lozinka ne može biti prazna")
    private String passwordHash;

    @NotBlank(message = "Uloga je obavezna")
    private String role;

    private String status;
    private LocalDateTime dateCreated;
}

