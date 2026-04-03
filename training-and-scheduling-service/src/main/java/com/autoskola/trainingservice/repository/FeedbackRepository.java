package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}
