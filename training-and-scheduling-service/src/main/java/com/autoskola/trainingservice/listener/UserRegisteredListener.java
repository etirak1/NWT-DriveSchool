package com.autoskola.trainingservice.listener;

import com.autoskola.trainingservice.event.UserRegisteredEvent;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class UserRegisteredListener {

    private static final Logger log = LoggerFactory.getLogger(UserRegisteredListener.class);

    private final CandidateRepository candidateRepository;
    private final InstructorRepository instructorRepository;
    private final TrainingRuleRepository ruleRepository;

    public UserRegisteredListener(CandidateRepository candidateRepository,
                                  InstructorRepository instructorRepository,
                                  TrainingRuleRepository ruleRepository) {
        this.candidateRepository = candidateRepository;
        this.instructorRepository = instructorRepository;
        this.ruleRepository = ruleRepository;
    }

    @RabbitListener(queues = "user_registered_queue")
    public void handleUserRegistered(UserRegisteredEvent event) {
        Long userId = event.getUserId();
        String role = event.getRole();

        if ("CANDIDATE".equalsIgnoreCase(role)) {
            if (candidateRepository.existsByUserId(userId)) {
                log.debug("Kandidat već postoji za userId: {}, preskačem.", userId);
                return;
            }
            Candidate candidate = new Candidate();
            candidate.setUserId(userId);
            candidate.setEnrollmentDate(LocalDate.now());
            candidate.setProgressPercentage(BigDecimal.ZERO);
            candidateRepository.save(candidate);
            log.info("Kandidat kreiran za userId: {}", userId);

        } else if ("INSTRUCTOR".equalsIgnoreCase(role) || "INSTRUKTOR".equalsIgnoreCase(role)) {
            if (instructorRepository.existsByUserId(userId)) {
                log.debug("Instruktor već postoji za userId: {}, preskačem.", userId);
                return;
            }
            Instructor instructor = new Instructor();
            instructor.setUserId(userId);
            instructorRepository.save(instructor);
            log.info("Instruktor kreiran za userId: {}", userId);
        }
    }
}
