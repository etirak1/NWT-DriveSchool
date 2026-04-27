package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.Lesson;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    @EntityGraph(attributePaths = {"candidate", "instructor"})
    List<Lesson> findAll();

    @Query("SELECT l FROM Lesson l WHERE l.instructor.instructorId = :instId AND l.status = 'ZAKAZANO'")
    List<Lesson> findUpcomingByInstructor(@Param("instId") Long instId);
}
