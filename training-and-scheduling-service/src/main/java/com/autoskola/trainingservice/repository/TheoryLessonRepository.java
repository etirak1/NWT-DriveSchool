package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.TheoryLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TheoryLessonRepository extends JpaRepository<TheoryLesson, Long> {

    List<TheoryLesson> findByCandidateCandidateIdOrderByLessonNumber(Long candidateId);

    Optional<TheoryLesson> findByCandidateCandidateIdAndLessonNumber(Long candidateId, Integer lessonNumber);

    long countByCandidateCandidateIdAndCompletedTrue(Long candidateId);

    void deleteAllByCandidateCandidateId(Long candidateId);
}
