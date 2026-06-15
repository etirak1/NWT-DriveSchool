package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.Lesson;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    @EntityGraph(attributePaths = {"candidate", "instructor"})
    List<Lesson> findAll();

    @Query("SELECT l FROM Lesson l WHERE l.instructor.userId = :userId AND l.status = 'ZAKAZANO'")
    List<Lesson> findUpcomingByInstructorUserId(@Param("userId") Long userId);

    @Query("SELECT l FROM Lesson l WHERE l.instructor.instructorId = :instructorId " +
            "AND l.dateTime >= :dayStart AND l.dateTime < :dayEnd " +
            "AND l.status IN ('ZAKAZANO', 'PENDING')")
    List<Lesson> findInstructorLessonsForDay(@Param("instructorId") Long instructorId,
                                             @Param("dayStart") LocalDateTime dayStart,
                                             @Param("dayEnd") LocalDateTime dayEnd);
    @Query("SELECT l FROM Lesson l WHERE l.instructor.instructorId = :instructorId " +
            "AND l.status IN ('ZAKAZANO', 'PENDING') " +
            "AND l.dateTime < :newEnd " +
            "AND FUNCTION('TIMESTAMPADD', MINUTE, l.duration, l.dateTime) > :newStart")
    List<Lesson> findOverlappingInstructorLessons(@Param("instructorId") Long instructorId,
                                                  @Param("newStart") LocalDateTime newStart,
                                                  @Param("newEnd") LocalDateTime newEnd);

    @Query("SELECT l FROM Lesson l WHERE l.vehicleId = :vehicleId " +
            "AND l.status IN ('ZAKAZANO', 'PENDING') " +
            "AND l.dateTime < :newEnd " +
            "AND FUNCTION('TIMESTAMPADD', MINUTE, l.duration, l.dateTime) > :newStart")
    List<Lesson> findOverlappingVehicleLessons(@Param("vehicleId") Long vehicleId,
                                               @Param("newStart") LocalDateTime newStart,
                                               @Param("newEnd") LocalDateTime newEnd);


    Page<Lesson> findByCandidateUserId(Long userId, Pageable pageable);
    Page<Lesson> findByInstructorUserId(Long userId, Pageable pageable);

    @Query("SELECT l FROM Lesson l WHERE l.candidate.userId = :userId AND l.status = 'PENDING' ORDER BY l.dateTime ASC")
    List<Lesson> findPendingByCandidate(@Param("userId") Long userId);


    List<Lesson> findByCandidateCandidateIdAndLessonTypeIgnoreCase(Long candidateId, String lessonType);
    void deleteByCandidateCandidateId(Long candidateId);

    @Modifying
    @Transactional
    @Query("UPDATE Lesson l SET l.status = 'ODRAĐENO' WHERE l.candidate.candidateId = :candidateId AND UPPER(l.lessonType) = 'VOŽNJA'")
    int markAllDrivingLessonsCompleted(@Param("candidateId") Long candidateId);

    @Query("SELECT COUNT(l) FROM Lesson l " +
            "WHERE l.candidate.candidateId = :candidateId " +
            "AND l.status IN ('ZAKAZANO', 'ODRAĐENO', 'PENDING') " +
            "AND UPPER(l.lessonType) = 'VOŽNJA' " +
            "AND l.dateTime >= :weekStart AND l.dateTime < :weekEnd")
    long countDrivingLessonsInWeek(@Param("candidateId") Long candidateId,
                                   @Param("weekStart") LocalDateTime weekStart,
                                   @Param("weekEnd") LocalDateTime weekEnd);
}


