package com.autoskola.trainingservice.listener;

import com.autoskola.trainingservice.event.UserRegisteredEvent;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

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
        if (!"CANDIDATE".equals(event.getRole())) return;

        Long userId = event.getUserId();


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
    }
}