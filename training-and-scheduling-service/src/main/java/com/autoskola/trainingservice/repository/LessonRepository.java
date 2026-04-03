package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
}
