package com.autoskola.resourceservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleId;

    private String brand;
    private String model;
    private String registrationNumber;
    private String status; // npr. ACTIVE, IN_REPAIR

    private LocalDateTime lastTechnicalInspection;
    private LocalDateTime registrationDate;

    private LocalDateTime dateCreated;

    @PrePersist
    protected void onCreate() {
        dateCreated = LocalDateTime.now();
    }
}