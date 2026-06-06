package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.TheorySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheorySessionRepository extends JpaRepository<TheorySession, Long> {

    List<TheorySession> findByPlanIdOrderBySessionNumber(Long planId);

    List<TheorySession> findByPlanIdAndStatus(Long planId, String status);
}