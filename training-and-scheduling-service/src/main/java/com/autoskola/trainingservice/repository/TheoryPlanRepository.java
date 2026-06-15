package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.TheoryPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheoryPlanRepository extends JpaRepository<TheoryPlan, Long> {

    List<TheoryPlan> findByCandidatesContainingOrderByStartDateDesc(
            com.autoskola.trainingservice.model.Candidate candidate
    );

    List<TheoryPlan> findAllByOrderByStartDateDesc();

    @Modifying
    @Query(value = "DELETE FROM theory_plan_candidates WHERE candidate_id = :candidateId", nativeQuery = true)
    void removeCandidateFromAllPlans(@Param("candidateId") Long candidateId);
}