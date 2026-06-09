package com.autoskola.resourceservice.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "repairs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Repairs {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long repairId;

    @NotNull(message = "Vozilo je obavezno")
    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @NotNull(message = "Datum popravke je obavezan")
    private LocalDateTime repairDate;

    @NotBlank(message = "Opis popravke je obavezan")
    @Size(max = 500, message = "Opis može imati maksimalno 500 karaktera")
    private String description;

    @NotNull(message = "Cijena je obavezna")
    @Positive(message = "Cijena mora biti pozitivan broj")
    private Double cost;

    private String status = "PLANNED";

    private LocalDateTime dateCreated;

    @PrePersist
    protected void onCreate() {
        dateCreated = LocalDateTime.now();
    }
}