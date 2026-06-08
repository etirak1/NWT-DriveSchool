package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.CandidateDTO;
import com.autoskola.trainingservice.dto.FeedbackDTO;
import com.autoskola.trainingservice.dto.InstructorDTO;
import com.autoskola.trainingservice.dto.NotificationMessage;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Feedback;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.InstructorNotification;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.FeedbackRepository;
import com.autoskola.trainingservice.repository.InstructorNotificationRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final CandidateRepository candidateRepository;
    private final InstructorRepository instructorRepository;
    private final CandidateService candidateService;
    private final InstructorService instructorService;
    private final SimpMessagingTemplate messagingTemplate;
    private final InstructorNotificationRepository notificationRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, CandidateRepository candidateRepository,
                           InstructorRepository instructorRepository,
                           CandidateService candidateService,
                           InstructorService instructorService,
                           SimpMessagingTemplate messagingTemplate,
                           InstructorNotificationRepository notificationRepository) {
        this.feedbackRepository = feedbackRepository;
        this.candidateRepository = candidateRepository;
        this.instructorRepository = instructorRepository;
        this.candidateService = candidateService;
        this.instructorService = instructorService;
        this.messagingTemplate = messagingTemplate;
        this.notificationRepository = notificationRepository;
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

        if (candidate.getProgressPercentage() == null ||
                candidate.getProgressPercentage().compareTo(new BigDecimal("100")) < 0) {
            throw new RuntimeException("Kandidat mora završiti obuku prije ocjenjivanja instruktora.");
        }

        if (feedbackRepository.existsByCandidateCandidateId(candidate.getCandidateId())) {
            throw new RuntimeException("Već ste ostavili ocjenu za svog instruktora.");
        }

        Instructor instructor = instructorRepository.findById(feedback.getInstructor().getInstructorId())
                .orElseThrow(() -> new RuntimeException("Instruktor nije pronađen"));

        feedback.setCandidate(candidate);
        feedback.setInstructor(instructor);
        Feedback savedFeedback = feedbackRepository.save(feedback);

        try {
            UserDTO candidateUser = candidateService.getCandidateFullDetails(candidate.getCandidateId()).getUser();
            String candidateName = candidateUser != null
                    ? candidateUser.getFirstName() + " " + candidateUser.getLastName()
                    : "Kandidat";
            String stars = "★".repeat(savedFeedback.getRating()) + "☆".repeat(5 - savedFeedback.getRating());
            String body = candidateName + " je ostavio/la ocjenu " + stars;

            // Snimi u bazu — notifikacija je dostupna i kad instruktor nije online
            InstructorNotification saved = new InstructorNotification();
            saved.setInstructorUserId(instructor.getUserId());
            saved.setType("NEW_FEEDBACK");
            saved.setTitle("Nova ocjena");
            saved.setBody(body);
            notificationRepository.save(saved);

            // Pošalji i WebSocket poruku za real-time (ako je konekcija aktivna)
            NotificationMessage notification = new NotificationMessage(
                    "NEW_FEEDBACK", "Nova ocjena", body,
                    Map.of("feedbackId", savedFeedback.getFeedbackId(),
                           "rating", savedFeedback.getRating(),
                           "candidateName", candidateName,
                           "notificationId", saved.getId())
            );
            messagingTemplate.convertAndSend(
                    "/topic/instructor." + instructor.getUserId(),
                    notification
            );
        } catch (Exception ignored) {
        }

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