package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.model.*;
import com.autoskola.trainingservice.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class TrainingDataInitializer {

    private final TrainingRuleRepository ruleRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public TrainingDataInitializer(TrainingRuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
    }

    @Transactional
    public void init() {
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS=0").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE feedbacks").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE lessons").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE driving_lessons").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE theory_lessons").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE training_phases").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE candidates").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE instructors").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE training_rules").executeUpdate();
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS=1").executeUpdate();

        ruleRepository.save(new TrainingRule(
                null, 30, 35, 45, new BigDecimal("1200.00"), 4));

        System.out.println("Training service: inicijalizacija završena.");
    }
}