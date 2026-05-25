package com.autoskola.resourceservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class VehicleRequestDTO {

    @NotBlank(message = "Marka vozila je obavezna")
    private String brand;

    @NotBlank(message = "Model vozila je obavezan")
    private String model;

    @NotBlank(message = "Registracijski broj je obavezan")
    @Size(min = 5, max = 15, message = "Registracijski broj mora imati između 5 i 15 karaktera")
    private String registrationNumber;

    @NotBlank(message = "Status vozila je obavezan")
    private String status;

    private LocalDateTime lastTechnicalInspection;
    private LocalDateTime registrationDate;

    public VehicleRequestDTO() {}

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getLastTechnicalInspection() { return lastTechnicalInspection; }
    public void setLastTechnicalInspection(LocalDateTime lastTechnicalInspection) { this.lastTechnicalInspection = lastTechnicalInspection; }

    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }
}