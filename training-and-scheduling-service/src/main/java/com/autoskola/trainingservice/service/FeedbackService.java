package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.CandidateDTO;
import com.autoskola.trainingservice.dto.FeedbackDTO;
import com.autoskola.trainingservice.dto.InstructorDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Feedback;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.InstructorNotification;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.FeedbackRepository;
import com.autoskola.trainingservice.repository.InstructorNotificationRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final CandidateRepository candidateRepository;
    private final InstructorRepository instructorRepository;
    private final CandidateService candidateService;
    private final InstructorService instructorService;
    private final InstructorNotificationRepository notificationRepository;
    private final TrainingPhaseRepository trainingPhaseRepository;
    private static final Logger log = LoggerFactory.getLogger(FeedbackService.class);


    public FeedbackService(FeedbackRepository feedbackRepository, CandidateRepository candidateRepository,
                           InstructorRepository instructorRepository,
                           CandidateService candidateService,
                           InstructorService instructorService,
                           InstructorNotificationRepository notificationRepository,
                           TrainingPhaseRepository trainingPhaseRepository) {
        this.feedbackRepository = feedbackRepository;
        this.candidateRepository = candidateRepository;
        this.instructorRepository = instructorRepository;
        this.candidateService = candidateService;
        this.instructorService = instructorService;
        this.notificationRepository = notificationRepository;
        this.trainingPhaseRepository = trainingPhaseRepository;
    }

    public FeedbackDTO getFeedbackDetails(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ocjena nije pronađena"));
        CandidateDTO candidateDTO = candidateService.getCandidateFullDetails(feedback.getCandidate().getCandidateId());
        InstructorDTO instructorDTO = instructorService.getInstructorFullDetails(feedback.getInstructor().getInstructorId());

        return new FeedbackDTO(
                feedback.getFeedbackId(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.getDateCreated(),
                candidateDTO,
                instructorDTO
        );
    }

    public FeedbackDTO createFeedback(Feedback feedback) {
        Candidate candidate = candidateRepository.findById(feedback.getCandidate().getCandidateId())
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));

        boolean practicalExamPassed = trainingPhaseRepository
                .findByCandidateCandidateIdAndPhaseTypeIgnoreCase(candidate.getCandidateId(), "PRAKTICNI_ISPIT")
                .stream().anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()))
            || trainingPhaseRepository
                .findByCandidateCandidateIdAndPhaseTypeIgnoreCase(candidate.getCandidateId(), "PRAKTIČNI ISPIT")
                .stream().anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()));

        if (!practicalExamPassed) {
            throw new IllegalArgumentException("Kandidat mora završiti obuku prije ocjenjivanja instruktora.");
        }

        if (feedbackRepository.existsByCandidateCandidateId(candidate.getCandidateId())) {
            throw new IllegalArgumentException("Već ste ostavili ocjenu za svog instruktora.");
        }
        Instructor instructor = instructorRepository.findById(feedback.getInstructor().getInstructorId())
                .orElseThrow(() -> new RuntimeException("Instruktor nije pronađen"));

        feedback.setCandidate(candidate);
        feedback.setInstructor(instructor);
        Feedback savedFeedback = feedbackRepository.save(feedback);


        String candidateName = "Kandidat";
        try {
            UserDTO candidateUser = candidateService.getCandidateFullDetails(candidate.getCandidateId()).getUser();
            if (candidateUser != null) {
                candidateName = candidateUser.getFirstName() + " " + candidateUser.getLastName();
            }
        } catch (Exception e) {
            log.warn("Nije moguće dohvatiti ime kandidata, koristi se fallback: {}", e.getMessage());
        }

        String stars = "★".repeat(savedFeedback.getRating()) + "☆".repeat(5 - savedFeedback.getRating());
        String body = candidateName + " je ostavio/la ocjenu " + stars;
        if (savedFeedback.getComment() != null && !savedFeedback.getComment().isBlank()) {
            body += ": \"" + savedFeedback.getComment() + "\"";
        }

        InstructorNotification saved = new InstructorNotification();
        saved.setInstructorUserId(instructor.getUserId());
        saved.setType("NEW_FEEDBACK");
        saved.setTitle("Nova ocjena");
        saved.setBody(body);
        notificationRepository.save(saved);

        return new FeedbackDTO(
                savedFeedback.getFeedbackId(),
                savedFeedback.getRating(),
                savedFeedback.getComment(),
                savedFeedback.getDateCreated(),
                null,
                null
        );
    }

}