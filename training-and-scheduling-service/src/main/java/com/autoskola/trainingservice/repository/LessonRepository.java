package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    @EntityGraph(attributePaths = {"candidate", "instructor"})
    List<Lesson> findAll();

    @Query("SELECT l FROM Lesson l WHERE l.instructor.userId = :userId AND l.status = 'ZAKAZANO'")
    List<Lesson> findUpcomingByInstructorUserId(@Param("userId") Long userId);
}
