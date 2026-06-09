package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.Instructor;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InstructorDTO {

    private Long instructorId;
    private UserDTO user;
    private Long assignedVehicleId;
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleRegistrationNumber;
    private String vehicleStatus;
    private String availabilityNote;

}