package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.FeedbackWithUsersDTO;
import com.autoskola.trainingservice.model.Feedback;
import com.autoskola.trainingservice.repository.FeedbackRepository;
import com.autoskola.trainingservice.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final FeedbackRepository feedbackRepository;

    public FeedbackController(FeedbackService feedbackService, FeedbackRepository feedbackRepository) {
        this.feedbackService = feedbackService;
        this.feedbackRepository = feedbackRepository;
    }

    @GetMapping("/{id}")
    public FeedbackWithUsersDTO getFeedback(@PathVariable Long id) {
        return feedbackService.getFeedbackDetails(id);
    }

    @PostMapping
    public ResponseEntity<FeedbackWithUsersDTO> leaveFeedback(@Valid @RequestBody Feedback feedback) {

        Feedback savedFeedback = feedbackRepository.save(feedback);
        FeedbackWithUsersDTO response = feedbackService.getFeedbackDetails(savedFeedback.getFeedbackId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);


    }
}