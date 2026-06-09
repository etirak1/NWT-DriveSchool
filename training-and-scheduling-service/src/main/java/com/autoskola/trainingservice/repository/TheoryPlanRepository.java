package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.TheoryPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheoryPlanRepository extends JpaRepository<TheoryPlan, Long> {

    List<TheoryPlan> findByCandidatesContainingOrderByStartDateDesc(
            com.autoskola.trainingservice.model.Candidate candidate
    );

    List<TheoryPlan> findAllByOrderByStartDateDesc();
}