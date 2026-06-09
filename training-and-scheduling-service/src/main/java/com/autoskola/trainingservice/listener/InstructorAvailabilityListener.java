package com.autoskola.trainingservice.listener;

import com.autoskola.trainingservice.repository.InstructorRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Component
public class InstructorAvailabilityListener {

    private final InstructorRepository instructorRepository;

    public InstructorAvailabilityListener(InstructorRepository instructorRepository) {
        this.instructorRepository = instructorRepository;
    }

    @RabbitListener(queues = "training_instructor_availability_queue")
    @Transactional
    public void handleAvailabilityUpdated(Map<String, Object> event) {
        Long userId = event.get("userId") instanceof Number
                ? ((Number) event.get("userId")).longValue()
                : null;
        String availabilityNote = (String) event.get("availabilityNote");

        if (userId == null || availabilityNote == null) return;

        instructorRepository.findByUserId(userId).ifPresent(instructor -> {
            instructor.setAvailabilityNote(availabilityNote);
            instructorRepository.save(instructor);
        });
    }
}
