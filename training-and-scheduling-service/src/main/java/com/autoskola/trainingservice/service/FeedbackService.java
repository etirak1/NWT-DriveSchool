package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.FeedbackWithUsersDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Feedback;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.FeedbackRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
import org.springframework.stereotype.Service;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final InstructorRepository instructorRepository;
    private final CandidateRepository candidateRepository;
    private final UserService userService;

    public FeedbackService(FeedbackRepository feedbackRepository, InstructorRepository instructorRepository, CandidateRepository candidateRepository,
                           UserService userService) {
        this.feedbackRepository = feedbackRepository;
        this.instructorRepository = instructorRepository;
        this.candidateRepository = candidateRepository;
        this.userService = userService;
    }

    public FeedbackWithUsersDTO getFeedbackDetails(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback nije pronađen"));

        Instructor fullInstructor = instructorRepository.findById(feedback.getInstructor().getInstructorId())
                .orElseThrow(() -> new RuntimeException("Instruktor nije pronađen"));

        Candidate fullCandidate = candidateRepository.findById(feedback.getCandidate().getCandidateId())
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));

        feedback.setInstructor(fullInstructor);
        feedback.setCandidate(fullCandidate);

        UserDTO instructorUser = userService.getUserById(
                fullInstructor.getUserId()
        );

        UserDTO candidateUser = userService.getUserById(
                fullCandidate.getUserId()
        );
        return new FeedbackWithUsersDTO(
                feedback,
                instructorUser,
                candidateUser
        );
    }
}