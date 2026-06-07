package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.InstructorNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InstructorNotificationRepository extends JpaRepository<InstructorNotification, Long> {

    List<InstructorNotification> findByInstructorUserIdOrderByTimestampDesc(Long instructorUserId);

    long countByInstructorUserIdAndReadFalse(Long instructorUserId);
}
