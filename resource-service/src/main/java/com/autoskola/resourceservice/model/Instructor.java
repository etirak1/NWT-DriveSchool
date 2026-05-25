package com.autoskola.resourceservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "instructors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Instructor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long instructorId;

    @NotNull(message = "ID korisnika je obavezan")
    private Long userId;

    @NotBlank(message = "Napomena o dostupnosti je obavezna")
    @Size(max = 255, message = "Napomena može imati maksimalno 255 karaktera")
    private String availabilityNote;
    private Long assignedVehicleId;


    private LocalDateTime dateCreated;

    @PrePersist
    protected void onCreate() {
        dateCreated = LocalDateTime.now();
    }

}