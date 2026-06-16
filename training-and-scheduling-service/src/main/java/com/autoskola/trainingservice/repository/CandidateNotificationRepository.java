package com.autoskola.trainingservice.repository;

import com.autoskola.trainingservice.model.CandidateNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateNotificationRepository extends JpaRepository<CandidateNotification, Long> {

    List<CandidateNotification> findByCandidateUserIdOrderByTimestampDesc(Long candidateUserId);

    long countByCandidateUserIdAndReadFalse(Long candidateUserId);
}
