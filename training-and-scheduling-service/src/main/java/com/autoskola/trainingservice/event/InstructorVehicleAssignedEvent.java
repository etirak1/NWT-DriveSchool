package com.autoskola.trainingservice.event;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InstructorVehicleAssignedEvent {
    private Long instructorId;
    private Long instructorUserId;
    private Long vehicleId;
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleRegistrationNumber;
    private String vehicleStatus;
}