package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.LessonWithUsersDTO;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.repository.LessonRepository;
import com.autoskola.trainingservice.service.LessonService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonService lessonService;
    private final LessonRepository lessonRepository;

    public LessonController(LessonService lessonService, LessonRepository lessonRepository) {
        this.lessonService = lessonService;
        this.lessonRepository = lessonRepository;
    }

    // Detaljan prikaz časa sa imenima kandidata i instruktora
    @GetMapping("/{id}")
    public LessonWithUsersDTO getLesson(@PathVariable Long id) {
        return lessonService.getLessonDetails(id);
    }

    @PostMapping
    public Lesson scheduleLesson(@Valid @RequestBody Lesson lesson) {
        return lessonRepository.save(lesson);
    }
}