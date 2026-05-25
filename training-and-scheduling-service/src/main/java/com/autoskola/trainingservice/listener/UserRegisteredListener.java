package com.autoskola.trainingservice.listener;

import com.autoskola.trainingservice.event.UserRegisteredEvent;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class UserRegisteredListener {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private InstructorRepository instructorRepository;

    @Autowired
    private TrainingRuleRepository ruleRepository;

    @RabbitListener(queues = "user_registered_queue")
    public void handleUserRegistered(UserRegisteredEvent event) {
        Long userId = event.getUserId();
        String role = event.getRole();

        if ("CANDIDATE".equalsIgnoreCase(role)) {
            if (candidateRepository.findByUserId(userId).isPresent()) {
                System.out.println("Kandidat već postoji za userId: " + userId + ", preskačem.");
                return;
            }
            Candidate candidate = new Candidate();
            candidate.setUserId(userId);
            candidate.setEnrollmentDate(LocalDate.now());
            candidate.setProgressPercentage(BigDecimal.ZERO);
            candidateRepository.save(candidate);
            System.out.println("Kandidat kreiran za userId: " + userId);

        } else if ("INSTRUCTOR".equalsIgnoreCase(role) || "INSTRUKTOR".equalsIgnoreCase(role)) {
            if (instructorRepository.existsByUserId(userId)) {
                System.out.println("Instruktor već postoji za userId: " + userId + ", preskačem.");
                return;
            }
            Instructor instructor = new Instructor();
            instructor.setUserId(userId);
            instructorRepository.save(instructor);
            System.out.println("Instruktor kreiran za userId: " + userId);
        }
    }
}