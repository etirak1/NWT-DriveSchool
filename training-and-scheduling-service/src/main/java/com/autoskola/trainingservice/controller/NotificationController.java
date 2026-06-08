package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.model.InstructorNotification;
import com.autoskola.trainingservice.repository.InstructorNotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final InstructorNotificationRepository repository;

    public NotificationController(InstructorNotificationRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/instructor/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<List<InstructorNotification>> getForInstructor(@PathVariable Long userId) {
        return ResponseEntity.ok(repository.findByInstructorUserIdOrderByTimestampDesc(userId));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        repository.findById(id).ifPresent(n -> {
            n.setRead(true);
            repository.save(n);
        });
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/instructor/{userId}/read-all")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<Void> markAllRead(@PathVariable Long userId) {
        List<InstructorNotification> all = repository.findByInstructorUserIdOrderByTimestampDesc(userId);
        all.forEach(n -> n.setRead(true));
        repository.saveAll(all);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/instructor/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<Void> clearAll(@PathVariable Long userId) {
        List<InstructorNotification> all = repository.findByInstructorUserIdOrderByTimestampDesc(userId);
        repository.deleteAll(all);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/instructor/{userId}/unread-count")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Long>> unreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", repository.countByInstructorUserIdAndReadFalse(userId)));
    }
}
