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
        // Truncate samo training_rules
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS=0").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE training_rules").executeUpdate();
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS=1").executeUpdate();

        if (ruleRepository.count() == 0) {
            ruleRepository.save(new TrainingRule(
                    null, 30, 35, 45, new BigDecimal("1200.00"), 4));
            System.out.println("Training rule kreiran.");
        }

        System.out.println("Training service: inicijalizacija završena.");
    }
}