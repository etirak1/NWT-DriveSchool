package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
