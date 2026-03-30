package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.FeedbackWithUsersDTO;
import com.autoskola.trainingservice.model.Feedback;
import com.autoskola.trainingservice.repository.FeedbackRepository;
import com.autoskola.trainingservice.service.FeedbackService;
import org.springframework.web.bind.annotation.*;

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
    public Feedback leaveFeedback(@RequestBody Feedback feedback) {
        return feedbackRepository.save(feedback);
    }
}