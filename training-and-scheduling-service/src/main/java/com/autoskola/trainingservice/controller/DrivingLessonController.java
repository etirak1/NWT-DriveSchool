package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.model.DrivingLesson;
import com.autoskola.trainingservice.service.DrivingLessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driving-lessons")
public class DrivingLessonController {

    private final DrivingLessonService drivingLessonService;

    public DrivingLessonController(DrivingLessonService drivingLessonService) {
        this.drivingLessonService = drivingLessonService;
    }

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_INSTRUCTOR', 'ROLE_CANDIDATE')")
    public ResponseEntity<List<DrivingLesson>> getLessons(@PathVariable Long candidateId) {
        return ResponseEntity.ok(drivingLessonService.getLessonsForCandidate(candidateId));
    }

    @PostMapping("/candidate/{candidateId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_INSTRUCTOR')")
    public ResponseEntity<?> addLesson(
            @PathVariable Long candidateId,
            @RequestBody Map<String, Object> body) {
        try {
            Integer lessonNumber = (Integer) body.get("lessonNumber");
            LocalDate date = LocalDate.parse((String) body.get("date"));
            String notes = (String) body.getOrDefault("notes", "");
            DrivingLesson saved = drivingLessonService.addLesson(candidateId, lessonNumber, date, notes);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/candidate/{candidateId}/lesson/{lessonNumber}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_INSTRUCTOR')")
    public ResponseEntity<Void> deleteLesson(
            @PathVariable Long candidateId,
            @PathVariable Integer lessonNumber) {
        drivingLessonService.deleteLesson(candidateId, lessonNumber);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/candidate/{candidateId}/count")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_INSTRUCTOR', 'ROLE_CANDIDATE')")
    public ResponseEntity<Map<String, Long>> getCount(@PathVariable Long candidateId) {
        long count = drivingLessonService.getCompletedCount(candidateId);
        return ResponseEntity.ok(Map.of("completed", count, "total", 40L));
    }
}