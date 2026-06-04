package com.autoskola.resourceservice.repository;

import com.autoskola.resourceservice.model.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {
    boolean existsByUserId(Long userId);


    @Transactional
    @Modifying
    void deleteByUserId(Long userId);

}