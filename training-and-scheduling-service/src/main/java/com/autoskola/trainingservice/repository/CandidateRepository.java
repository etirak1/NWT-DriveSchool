package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    List<Candidate> findByAssignedInstructor(Instructor instructor);

    @Modifying
    @Query("UPDATE Candidate c SET c.assignedInstructor = NULL WHERE c.assignedInstructor = :instructor")
    void unassignInstructor(@Param("instructor") Instructor instructor);
}
