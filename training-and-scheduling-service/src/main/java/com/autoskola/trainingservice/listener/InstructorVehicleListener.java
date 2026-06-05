package com.autoskola.trainingservice.listener;

import com.autoskola.trainingservice.event.InstructorVehicleAssignedEvent;
import com.autoskola.trainingservice.repository.InstructorRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class InstructorVehicleListener {

    private final InstructorRepository instructorRepository;

    public InstructorVehicleListener(InstructorRepository instructorRepository) {
        this.instructorRepository = instructorRepository;
    }

    @RabbitListener(queues = "training_vehicle_assigned_queue")
    @Transactional
    public void handleVehicleAssigned(InstructorVehicleAssignedEvent event) {
        System.out.println("Training service primio event za userId: " + event.getInstructorUserId());

        instructorRepository.findByUserId(event.getInstructorUserId()).ifPresent(instructor -> {
            instructor.setAssignedVehicleId(event.getVehicleId());
            instructor.setVehicleBrand(event.getVehicleBrand());
            instructor.setVehicleModel(event.getVehicleModel());
            instructor.setVehicleRegistrationNumber(event.getVehicleRegistrationNumber());
            instructor.setVehicleStatus(event.getVehicleStatus());
            instructorRepository.save(instructor);
            System.out.println("SAVED! userId: " + event.getInstructorUserId());
        });
    }
}