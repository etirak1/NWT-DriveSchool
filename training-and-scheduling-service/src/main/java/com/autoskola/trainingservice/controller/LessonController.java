package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.LessonDTO;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.service.LessonService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.util.List;
import com.autoskola.trainingservice.service.LessonService;



@RestController
@EnableMethodSecurity
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
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
    public ResponseEntity<String> completeLesson(@PathVariable Long id) {
        String result = lessonService.completeLessonAndIncreaseProgress(id);
        return ResponseEntity.ok(result);
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
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "dateTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(lessonService.getLessonsByUserId(userId, pageable));
    }

}