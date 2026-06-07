package com.autoskola.resourceservice.repository;

import com.autoskola.resourceservice.model.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {
    boolean existsByUserId(Long userId);

    Optional<Instructor> findByAssignedVehicleIdAndInstructorIdNot(Long vehicleId, Long instructorId);

    List<Instructor> findAllByUserIdIn(List<Long> userIds);


    @Transactional
    @Modifying
    void deleteByUserId(Long userId);

}