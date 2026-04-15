package com.autoskola.resourceservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleId;

    @NotBlank(message = "Marka vozila je obavezna")
    private String brand;

    @NotBlank(message = "Model vozila je obavezan")
    private String model;

    @NotBlank(message = "Registracijski broj je obavezan")
    @Size(min = 5, max = 15, message = "Registracijski broj mora imati između 5 i 15 karaktera")
    private String registrationNumber;

    @NotBlank(message = "Status vozila je obavezan")
    private String status; // npr. ACTIVE, IN_REPAIR

    private LocalDateTime lastTechnicalInspection;

    private LocalDateTime registrationDate;

    private LocalDateTime dateCreated;

    @PrePersist
    protected void onCreate() {
        dateCreated = LocalDateTime.now();
    }
}