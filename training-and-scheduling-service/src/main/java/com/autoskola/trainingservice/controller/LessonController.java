package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.LessonDTO;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.service.LessonService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @GetMapping("/{id}")
    public LessonDTO getLesson(@PathVariable Long id) {
        return lessonService.getLessonDetails(id);
    }


    @PostMapping
    public LessonDTO scheduleLesson(@Valid @RequestBody Lesson lesson) {
        return lessonService.saveLesson(lesson);
    }

    @GetMapping
    public List<LessonDTO> getAllLessons() {
        return lessonService.getAllLessons();
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<String> completeLesson(@PathVariable Long id) {
        String result = lessonService.completeLessonAndIncreaseProgress(id);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/paged")
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
    public ResponseEntity<LessonDTO> updateNotes(@PathVariable Long id, @RequestBody String notes) {
        return ResponseEntity.ok(lessonService.patchLessonNotes(id, notes));
    }

    @Value("${server.port}")
    private String port;

    @GetMapping("/whoami")
    public String whoAmI() {
        return "Odgovor sa porta: " + port;
    }

}