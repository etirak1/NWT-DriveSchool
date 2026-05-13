package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.FeedbackDTO;
import com.autoskola.trainingservice.model.Feedback;
import com.autoskola.trainingservice.repository.FeedbackRepository;
import com.autoskola.trainingservice.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@EnableMethodSecurity
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public FeedbackDTO getFeedback(@PathVariable Long id) {
        return feedbackService.getFeedbackDetails(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN')")
    public ResponseEntity<FeedbackDTO> leaveFeedback(@Valid @RequestBody Feedback feedback) {
        FeedbackDTO response = feedbackService.createFeedback(feedback);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}