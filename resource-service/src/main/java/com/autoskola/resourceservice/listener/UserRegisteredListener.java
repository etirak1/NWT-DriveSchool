package com.autoskola.resourceservice.listener;

import com.autoskola.resourceservice.event.UserRegisteredEvent;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.model.User;
import com.autoskola.resourceservice.repository.InstructorRepository;
import com.autoskola.resourceservice.repository.UserRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class UserRegisteredListener {

    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;

    public UserRegisteredListener(InstructorRepository instructorRepository,
                                  UserRepository userRepository) {
        this.instructorRepository = instructorRepository;
        this.userRepository = userRepository;
    }

    @RabbitListener(queues = "user_registered_resource_queue")
    public void handleUserRegistered(UserRegisteredEvent event) {
        // Spremi korisnika u lokalnu tabelu ako ne postoji
        if (!userRepository.existsById(event.getUserId())) {
            User user = new User();
            user.setUserId(event.getUserId());
            user.setFirstName(event.getFirstName());
            user.setLastName(event.getLastName());
            user.setEmail(event.getEmail());
            user.setRole(event.getRole());
            user.setPasswordHash("N/A");
            user.setStatus("ACTIVE");
            userRepository.save(user);
            System.out.println("Korisnik sačuvan lokalno: userId=" + event.getUserId());
        }

        if (!"INSTRUCTOR".equalsIgnoreCase(event.getRole())) return;

        if (instructorRepository.existsByUserId(event.getUserId())) {
            System.out.println("Instruktor već postoji za userId: " + event.getUserId() + ", preskačem.");
            return;
        }

        Instructor instructor = new Instructor();
        instructor.setUserId(event.getUserId());
        instructor.setAvailabilityNote("AVAILABLE");
        instructorRepository.save(instructor);

        System.out.println("Instruktor kreiran za userId: " + event.getUserId());
    }
}