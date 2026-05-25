package com.autoskola.resourceservice.event;

import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorVehicleAssignedEvent implements Serializable {
    private Long instructorId;
    private Long instructorUserId;
    private Long vehicleId;
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleRegistrationNumber;
    private String vehicleStatus;
}