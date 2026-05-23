package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.model.*;
import com.autoskola.trainingservice.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class TrainingDataInitializer {

    private final TrainingRuleRepository ruleRepository;
    private final InstructorRepository instructorRepository;
    private final CandidateRepository candidateRepository;
    private final LessonRepository lessonRepository;
    private final TrainingPhaseRepository phaseRepository;
    private final FeedbackRepository feedbackRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public TrainingDataInitializer(TrainingRuleRepository ruleRepository,
                                   InstructorRepository instructorRepository,
                                   CandidateRepository candidateRepository,
                                   LessonRepository lessonRepository,
                                   TrainingPhaseRepository phaseRepository,
                                   FeedbackRepository feedbackRepository) {
        this.ruleRepository = ruleRepository;
        this.instructorRepository = instructorRepository;
        this.candidateRepository = candidateRepository;
        this.lessonRepository = lessonRepository;
        this.phaseRepository = phaseRepository;
        this.feedbackRepository = feedbackRepository;
    }

    @Transactional
    public void init() {
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS=0").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE feedbacks").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE training_phases").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE lessons").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE candidates").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE instructors").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE training_rules").executeUpdate();
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS=1").executeUpdate();

        TrainingRule bCategory = ruleRepository.save(new TrainingRule(
                null, 30, 35, 45, new BigDecimal("1200.00")));

        Instructor instructor1 = instructorRepository.save(new Instructor(null, 6L));
        Instructor instructor2 = instructorRepository.save(new Instructor(null, 8L));

        Candidate candidate1 = candidateRepository.save(new Candidate(
                null, 5L, LocalDate.now().minusDays(10), new BigDecimal("15.0"), instructor1, bCategory));

        Candidate candidate2 = candidateRepository.save(new Candidate(
                null, 7L, LocalDate.now().minusDays(10), new BigDecimal("15.0"), instructor2, bCategory));


        Candidate candidate3 = candidateRepository.save(new Candidate(
                null, 9L, LocalDate.now().minusDays(10), new BigDecimal("100.0"), instructor2, bCategory));


        lessonRepository.save(new Lesson(null, candidate1, instructor1, 1L,
                LocalDateTime.now().plusDays(2).withHour(10).withMinute(0), 45, "ZAKAZANO", "Vježba kretanja"));
        lessonRepository.save(new Lesson(null, candidate1, instructor1, 1L,
                LocalDateTime.now().plusDays(3).withHour(11).withMinute(0), 45, "ZAKAZANO", "Vježba poligon"));

        lessonRepository.save(new Lesson(null, candidate2, instructor2, 1L,
                LocalDateTime.now().plusDays(2).withHour(10).withMinute(0), 45, "ZAKAZANO", "Vježba kretanja"));
        lessonRepository.save(new Lesson(null, candidate2, instructor2, 1L,
                LocalDateTime.now().plusDays(3).withHour(11).withMinute(0), 45, "ZAKAZANO", "Vježba poligon"));


        phaseRepository.save(new TrainingPhase(
                null, candidate1, "TEORIJSKI DIO", "U TOKU", null));


        phaseRepository.save(new TrainingPhase(
                null, candidate2, "TEORIJSKI DIO", "U TOKU", null));


        phaseRepository.save(new TrainingPhase(
                null, candidate3, "TEORIJSKI DIO", "POLOŽENO", LocalDate.now()));
        phaseRepository.save(new TrainingPhase(
                null, candidate3, "PRAKTIČNA VOŽNJA", "POLOŽENO", LocalDate.now()));
        phaseRepository.save(new TrainingPhase(
                null, candidate3, "POLIGON", "POLOŽENO", LocalDate.now()));
        phaseRepository.save(new TrainingPhase(
                null, candidate3, "GRADSKA VOŽNJA", "POLOŽENO", LocalDate.now()));
        phaseRepository.save(new TrainingPhase(
                null, candidate3, "ISPIT", "POLOŽENO", LocalDate.now()));

        System.out.println("Training service: podaci uneseni!");
    }
}