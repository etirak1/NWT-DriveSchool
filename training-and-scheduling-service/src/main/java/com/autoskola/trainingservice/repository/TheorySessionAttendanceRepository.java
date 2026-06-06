package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.TheorySessionAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface TheorySessionAttendanceRepository extends JpaRepository<TheorySessionAttendance, Long> {

    List<TheorySessionAttendance> findBySessionId(Long sessionId);

    List<TheorySessionAttendance> findBySessionIdAndPresentTrue(Long sessionId);

    @Query("SELECT a FROM TheorySessionAttendance a WHERE a.session.id = :sessionId AND a.candidate.candidateId = :candidateId")
    Optional<TheorySessionAttendance> findBySessionAndCandidate(@Param("sessionId") Long sessionId, @Param("candidateId") Long candidateId);
    void deleteBySessionId(Long sessionId);

    @Query("SELECT COUNT(a) FROM TheorySessionAttendance a " +
           "WHERE a.session.plan.id = :planId AND a.candidate.candidateId = :candidateId AND a.present = true")
    long countAttendedByPlanAndCandidate(@Param("planId") Long planId, @Param("candidateId") Long candidateId);
}