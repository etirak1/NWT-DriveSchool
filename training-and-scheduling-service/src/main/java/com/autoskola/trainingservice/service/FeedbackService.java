package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.FeedbackWithUsersDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Feedback;
import com.autoskola.trainingservice.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserService userService;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           UserService userService) {
        this.feedbackRepository = feedbackRepository;
        this.userService = userService;
    }

    public FeedbackWithUsersDTO getFeedbackDetails(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback nije pronađen"));


        UserDTO instructorUser = userService.getUserById(
                feedback.getInstructor().getUserId()
        );

        UserDTO candidateUser = userService.getUserById(
                feedback.getCandidate().getUserId()
        );

        return new FeedbackWithUsersDTO(
                feedback,
                instructorUser,
                candidateUser
        );
    }
}