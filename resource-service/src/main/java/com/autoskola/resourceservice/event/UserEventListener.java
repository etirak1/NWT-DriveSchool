package com.autoskola.resourceservice.event;

import com.autoskola.resourceservice.config.RabbitMQConfig;
import com.autoskola.resourceservice.dto.UserDTO;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.repository.InstructorRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserEventListener {

    @RabbitListener(queues = RabbitMQConfig.QUEUE_VEHICLE_ASSIGNED)
    @Transactional
    public void handleVehicleAssigned(java.util.Map<String, Object> event) {
        Long instructorId = Long.valueOf(event.get("instructorId").toString());
        Long vehicleId = Long.valueOf(event.get("vehicleId").toString());
        System.out.println("Vozilo " + vehicleId + " dodijeljeno instruktoru " + instructorId);
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_USER_DELETED)
    @Transactional
    public void handleUserDeleted(Long userId) {
        System.out.println("Primljena poruka za brisanje instruktora sa userId: " + userId);

        instructorRepository.deleteByUserId(userId);
    }
    private final InstructorRepository instructorRepository;

    public UserEventListener(InstructorRepository instructorRepository) {
        this.instructorRepository = instructorRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_USER_REGISTERED)
    public void handleUserRegistered(UserDTO event) {
        if ("INSTRUCTOR".equalsIgnoreCase(event.getRole())) {
            if (!instructorRepository.existsByUserId(event.getUserId())) {
                Instructor instructor = new Instructor();
                instructor.setUserId(event.getUserId());
                instructor.setAvailabilityNote("Dostupan");
                instructorRepository.save(instructor);
            }
        }
    }
}