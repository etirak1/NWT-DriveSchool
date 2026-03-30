package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.FeedbackWithUsersDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Feedback;
import com.autoskola.trainingservice.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserClientService userClientService;

    public FeedbackService(FeedbackRepository feedbackRepository, UserClientService userClientService) {
        this.feedbackRepository = feedbackRepository;
        this.userClientService = userClientService;
    }

    public FeedbackWithUsersDTO getFeedbackDetails(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        UserDTO instructorUser = userClientService.getUserById(feedback.getInstructor().getUserId());
        UserDTO candidateUser = userClientService.getUserById(feedback.getCandidate().getUserId());

        return new FeedbackWithUsersDTO(feedback, instructorUser, candidateUser);
    }
}