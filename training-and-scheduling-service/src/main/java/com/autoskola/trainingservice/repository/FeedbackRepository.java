package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByInstructorInstructorId(Long instructorId);
}
