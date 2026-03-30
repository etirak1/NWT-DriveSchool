package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.TrainingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingRuleRepository extends JpaRepository<TrainingRule, Long> {
}
