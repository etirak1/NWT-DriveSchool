package com.autoskola.resourceservice.repository;

import com.autoskola.resourceservice.model.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {
    boolean existsByUserId(Long userId);

}