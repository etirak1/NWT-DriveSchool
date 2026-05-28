package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.DrivingLesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DrivingLessonRepository extends JpaRepository<DrivingLesson, Long> {

    List<DrivingLesson> findByCandidateCandidateIdOrderByLessonNumber(Long candidateId);

    Optional<DrivingLesson> findByCandidateCandidateIdAndLessonNumber(Long candidateId, Integer lessonNumber);

    long countByCandidateCandidateId(Long candidateId);
}