package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {
}
