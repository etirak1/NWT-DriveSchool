package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.LessonDTO;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.service.LessonService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;


@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    private Long getAuthenticatedUserId() {
        Object details = SecurityContextHolder.getContext().getAuthentication().getDetails();
        return ((Number) details).longValue();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public LessonDTO getLesson(@PathVariable Long id) {
        return lessonService.getLessonDetails(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public LessonDTO scheduleLesson(@Valid @RequestBody Lesson lesson) {
        return lessonService.saveLesson(lesson);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public List<LessonDTO> getAllLessons() {
        return lessonService.getAllLessons();
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Map<String, String>> completeLesson(
            @PathVariable Long id,
            @RequestParam(required = false) String topicCovered,
            @RequestParam(required = false) String teacherNotes) {
        lessonService.completeLessonAndIncreaseProgress(id, topicCovered, teacherNotes);
        return ResponseEntity.accepted().body(Map.of("message", "Akcija je pokrenuta"));
    }

    @GetMapping("/paged")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR','CANDIDATE')")
    public ResponseEntity<Page<LessonDTO>> getLessonsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "lessonId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(lessonService.getAllLessonsPaged(pageable));
    }

    @PatchMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR','CANDIDATE')")
    public ResponseEntity<LessonDTO> updateNotes(@PathVariable Long id, @RequestBody String notes) {
        return ResponseEntity.ok(lessonService.patchLessonNotes(id, notes));
    }

    @Value("${server.port}")
    private String port;

    @GetMapping("/whoami")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public String whoAmI() {
        return "Odgovor sa porta: " + port;
    }

    @GetMapping("/instructor/{userId}/has-active-sessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Boolean> hasActiveSessions(@PathVariable Long userId) {
        return ResponseEntity.ok(lessonService.hasActiveSessions(userId));
    }

    @GetMapping("/instructor/{instructorId}/availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public ResponseEntity<List<LessonDTO>> getInstructorAvailability(
            @PathVariable Long instructorId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        return ResponseEntity.ok(lessonService.getInstructorScheduleForDay(instructorId, date));
    }

    @GetMapping("/my-lessons")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public ResponseEntity<Page<LessonDTO>> getMyLessons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "dateTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Long userId = getAuthenticatedUserId();
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(lessonService.getLessonsByUserId(userId, pageable));
    }

    @GetMapping("/eligibility")
    @PreAuthorize("hasAnyRole('ADMIN', 'CANDIDATE')")
    public ResponseEntity<java.util.Map<String, Object>> getEligibility() {
        Long userId = getAuthenticatedUserId();
        return ResponseEntity.ok(lessonService.getBookingEligibility(userId));
    }

    @GetMapping("/instructor-lessons")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Page<LessonDTO>> getInstructorLessons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Long userId = getAuthenticatedUserId();
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(lessonService.getLessonsByInstructorUserId(userId, pageable));
    }

    @PostMapping("/propose")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<?> proposeLesson(@RequestBody java.util.Map<String, Object> body) {
        try {
            Long candidateId = Long.valueOf(body.get("candidateId").toString());
            LocalDateTime dateTime = LocalDateTime.parse(body.get("dateTime").toString());
            Integer duration = body.containsKey("duration") ? Integer.valueOf(body.get("duration").toString()) : 45;
            String notes = body.containsKey("notes") ? (String) body.get("notes") : null;
            lessonService.proposeLesson(candidateId, dateTime, duration, notes);
            return ResponseEntity.accepted().body(Map.of("message", "Akcija je pokrenuta"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'CANDIDATE')")
    public ResponseEntity<?> confirmLesson(@PathVariable Long id) {
        try {
            Long userId = getAuthenticatedUserId();
            lessonService.confirmLesson(id, userId);
            return ResponseEntity.accepted().body(Map.of("message", "Akcija je pokrenuta"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'CANDIDATE')")
    public ResponseEntity<?> rejectLesson(@PathVariable Long id) {
        try {
            Long userId = getAuthenticatedUserId();
            lessonService.rejectLesson(id, userId);
            return ResponseEntity.accepted().body(Map.of("message", "Akcija je pokrenuta"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'CANDIDATE')")
    public ResponseEntity<java.util.List<LessonDTO>> getPending() {
        Long userId = getAuthenticatedUserId();
        return ResponseEntity.ok(lessonService.getPendingForCandidate(userId));
    }

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'CANDIDATE')")
    public ResponseEntity<?> rescheduleLesson(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        try {
            LocalDateTime newDateTime = LocalDateTime.parse(body.get("dateTime"));
            Long userId = getAuthenticatedUserId();
            lessonService.rescheduleLesson(id, newDateTime, userId);
            return ResponseEntity.accepted().body(Map.of("message", "Akcija je pokrenuta"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
