package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.model.TrainingRule;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class TrainingDataInitializer {

    private static final Logger log = LoggerFactory.getLogger(TrainingDataInitializer.class);

    private final TrainingRuleRepository ruleRepository;

    public TrainingDataInitializer(TrainingRuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
    }

    @Transactional
    public void init() {
        if (ruleRepository.count() == 0) {
            ruleRepository.save(new TrainingRule(
                    null, 30, 35, 45, new BigDecimal("1200.00"), 4));
            log.info("Training service: TrainingRule kreiran.");
        } else {
            log.debug("Training service: podaci već postoje, preskačem inicijalizaciju.");
        }
    }
}
