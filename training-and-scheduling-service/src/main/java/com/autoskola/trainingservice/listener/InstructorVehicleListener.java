package com.autoskola.trainingservice.listener;

import com.autoskola.trainingservice.event.InstructorVehicleAssignedEvent;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.repository.InstructorRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class InstructorVehicleListener {

    private final InstructorRepository instructorRepository;

    public InstructorVehicleListener(InstructorRepository instructorRepository) {
        this.instructorRepository = instructorRepository;
    }

    @RabbitListener(queues = "instructor_vehicle_queue")
    public void handleInstructorVehicleAssigned(InstructorVehicleAssignedEvent event) {
        Instructor instructor = instructorRepository.findByUserId(event.getInstructorUserId())
                .orElse(null);

        if (instructor == null) {
            System.out.println("Instruktor sa userId=" + event.getInstructorUserId()
                    + " ne postoji u training-service. Preskačem događaj.");
            return;
        }

        instructor.setAssignedVehicleId(event.getVehicleId());
        instructor.setVehicleBrand(event.getVehicleBrand());
        instructor.setVehicleModel(event.getVehicleModel());
        instructor.setVehicleRegistrationNumber(event.getVehicleRegistrationNumber());
        instructor.setVehicleStatus(event.getVehicleStatus());
        instructorRepository.save(instructor);

        System.out.println("Vozilo " + event.getVehicleId() + " dodijeljeno instruktoru "
                + instructor.getInstructorId() + " (userId=" + event.getInstructorUserId() + ").");
    }
}