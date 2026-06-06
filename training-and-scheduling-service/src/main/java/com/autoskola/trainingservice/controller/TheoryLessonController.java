package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.model.TheoryLesson;
import com.autoskola.trainingservice.service.TheoryLessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/theory-lessons")
public class TheoryLessonController {

    private final TheoryLessonService theoryLessonService;

    public TheoryLessonController(TheoryLessonService theoryLessonService) {
        this.theoryLessonService = theoryLessonService;
    }


    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public ResponseEntity<List<TheoryLesson>> getLessons(@PathVariable Long candidateId) {
        return ResponseEntity.ok(theoryLessonService.getLessonsForCandidate(candidateId));
    }


    @PatchMapping("/candidate/{candidateId}/lesson/{lessonNumber}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TheoryLesson> toggleLesson(
            @PathVariable Long candidateId,
            @PathVariable Integer lessonNumber,
            @RequestBody Map<String, Boolean> body) {

        boolean completed = Boolean.TRUE.equals(body.get("completed"));
        TheoryLesson updated = theoryLessonService.toggleLesson(candidateId, lessonNumber, completed);
        return ResponseEntity.ok(updated);
    }


    @GetMapping("/candidate/{candidateId}/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public ResponseEntity<Map<String, Long>> getCompletedCount(@PathVariable Long candidateId) {
        long count = theoryLessonService.getCompletedCount(candidateId);
        return ResponseEntity.ok(Map.of("completed", count, "total", 40L));
    }

    @PatchMapping("/candidate/{candidateId}/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TheoryLesson>> bulkComplete(
            @PathVariable Long candidateId,
            @RequestBody Map<String, Integer> body) {
        int targetCount = body.get("count");
        return ResponseEntity.ok(theoryLessonService.bulkComplete(candidateId, targetCount));
    }
}
