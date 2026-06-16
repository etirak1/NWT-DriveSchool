package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.model.CandidateNotification;
import com.autoskola.trainingservice.model.InstructorNotification;
import com.autoskola.trainingservice.repository.CandidateNotificationRepository;
import com.autoskola.trainingservice.repository.InstructorNotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final InstructorNotificationRepository instructorRepo;
    private final CandidateNotificationRepository candidateRepo;

    public NotificationController(InstructorNotificationRepository instructorRepo,
                                  CandidateNotificationRepository candidateRepo) {
        this.instructorRepo = instructorRepo;
        this.candidateRepo = candidateRepo;
    }


    @GetMapping("/instructor/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<List<InstructorNotification>> getForInstructor(@PathVariable Long userId) {
        return ResponseEntity.ok(instructorRepo.findByInstructorUserIdOrderByTimestampDesc(userId));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        instructorRepo.findById(id).ifPresent(n -> {
            n.setRead(true);
            instructorRepo.save(n);
        });
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/instructor/{userId}/read-all")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<Void> markAllReadInstructor(@PathVariable Long userId) {
        List<InstructorNotification> all = instructorRepo.findByInstructorUserIdOrderByTimestampDesc(userId);
        all.forEach(n -> n.setRead(true));
        instructorRepo.saveAll(all);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/instructor/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<Void> clearAllInstructor(@PathVariable Long userId) {
        instructorRepo.deleteAll(instructorRepo.findByInstructorUserIdOrderByTimestampDesc(userId));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/instructor/{userId}/unread-count")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Long>> unreadCountInstructor(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", instructorRepo.countByInstructorUserIdAndReadFalse(userId)));
    }


    @GetMapping("/candidate/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE', 'ROLE_ADMIN')")
    public ResponseEntity<List<CandidateNotification>> getForCandidate(@PathVariable Long userId) {
        return ResponseEntity.ok(candidateRepo.findByCandidateUserIdOrderByTimestampDesc(userId));
    }

    @PutMapping("/candidate/{userId}/read-all")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE', 'ROLE_ADMIN')")
    public ResponseEntity<Void> markAllReadCandidate(@PathVariable Long userId) {
        List<CandidateNotification> all = candidateRepo.findByCandidateUserIdOrderByTimestampDesc(userId);
        all.forEach(n -> n.setRead(true));
        candidateRepo.saveAll(all);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/candidate/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE', 'ROLE_ADMIN')")
    public ResponseEntity<Void> clearAllCandidate(@PathVariable Long userId) {
        candidateRepo.deleteAll(candidateRepo.findByCandidateUserIdOrderByTimestampDesc(userId));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/candidate/{userId}/unread-count")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Long>> unreadCountCandidate(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", candidateRepo.countByCandidateUserIdAndReadFalse(userId)));
    }
}
