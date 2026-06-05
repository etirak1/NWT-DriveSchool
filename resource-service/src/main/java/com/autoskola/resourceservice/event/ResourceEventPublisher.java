package com.autoskola.resourceservice.event;

import com.autoskola.resourceservice.config.RabbitMQConfig;
import com.autoskola.resourceservice.model.Repairs;
import com.autoskola.resourceservice.model.User;
import com.autoskola.resourceservice.model.Vehicle;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ResourceEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public ResourceEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishRepairCreated(Repairs repair) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "repair.created", repair);
    }
    public void publishRepairUpdated(Repairs repair) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "repair.updated", repair);
    }
    public void publishRepairDeleted(Long repairId) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "repair.deleted",
                java.util.Map.of("repairId", repairId));
    }

    public void publishVehicleCreated(Vehicle vehicle) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "vehicle.created", vehicle);
    }
    public void publishVehicleUpdated(Vehicle vehicle) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "vehicle.updated", vehicle);
    }
    public void publishVehicleDeleted(Long vehicleId) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "vehicle.deleted",
                java.util.Map.of("vehicleId", vehicleId));
    }

    public void publishInstructorAvailabilityUpdated(Long instructorId, String availabilityNote) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "instructor.availability.updated",
                java.util.Map.of("instructorId", instructorId, "availabilityNote", availabilityNote));
    }


    public void publishUserCreated(User user) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "user.created", user);
    }
    public void publishUserUpdated(User user) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "user.updated", user);
    }
    public void publishUserDeleted(Long userId) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "user.deleted",
                java.util.Map.of("userId", userId));
    }
    public void publishVehicleAssigned(Long instructorId, Vehicle vehicle) {
        Map<String, Object> event = new HashMap<>();
        event.put("instructorId", instructorId);
        event.put("vehicleId", vehicle.getVehicleId());
        event.put("vehicleBrand", vehicle.getBrand());
        event.put("vehicleModel", vehicle.getModel());
        event.put("vehicleRegistrationNumber", vehicle.getRegistrationNumber());
        event.put("vehicleStatus", vehicle.getStatus());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "instructor.vehicle.assigned", event);
    }
}