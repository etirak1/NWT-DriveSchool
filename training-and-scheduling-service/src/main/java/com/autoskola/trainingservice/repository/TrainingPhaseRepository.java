package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.TrainingPhase;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

@Repository
public interface TrainingPhaseRepository extends JpaRepository<TrainingPhase, Long> {
}
