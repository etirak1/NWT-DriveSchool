package com.autoskola.trainingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDTO {
    private Long vehicleId;
    private String brand;
    private String model;
    private String registrationNumber;
    private String status;

    private LocalDateTime lastTechnicalInspection;
    private LocalDateTime registrationDate;
    private LocalDateTime dateCreated;



}