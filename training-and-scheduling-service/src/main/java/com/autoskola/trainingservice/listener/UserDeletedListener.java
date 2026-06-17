package com.autoskola.trainingservice.listener;

import com.autoskola.trainingservice.repository.*;
import com.autoskola.trainingservice.repository.TheoryPlanRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserDeletedListener {

    private static final Logger log = LoggerFactory.getLogger(UserDeletedListener.class);

    private final CandidateRepository candidateRepository;
    private final InstructorRepository instructorRepository;
    private final TrainingPhaseRepository trainingPhaseRepository;
    private final DrivingLessonRepository drivingLessonRepository;
    private final FeedbackRepository feedbackRepository;
    private final LessonRepository lessonRepository;
    private final TheorySessionAttendanceRepository attendanceRepository;
    private final TheoryLessonRepository theoryLessonRepository;
    private final TheoryPlanRepository theoryPlanRepository;

    public UserDeletedListener(CandidateRepository candidateRepository,
                               InstructorRepository instructorRepository,
                               TrainingPhaseRepository trainingPhaseRepository,
                               DrivingLessonRepository drivingLessonRepository,
                               FeedbackRepository feedbackRepository,
                               LessonRepository lessonRepository,
                               TheorySessionAttendanceRepository attendanceRepository,
                               TheoryLessonRepository theoryLessonRepository,
                               TheoryPlanRepository theoryPlanRepository) {
        this.candidateRepository = candidateRepository;
        this.instructorRepository = instructorRepository;
        this.trainingPhaseRepository = trainingPhaseRepository;
        this.drivingLessonRepository = drivingLessonRepository;
        this.feedbackRepository = feedbackRepository;
        this.lessonRepository = lessonRepository;
        this.attendanceRepository = attendanceRepository;
        this.theoryLessonRepository = theoryLessonRepository;
        this.theoryPlanRepository = theoryPlanRepository;
    }

    @Transactional
    @RabbitListener(queues = "training_user_deleted_queue")
    public void handleUserDeleted(Long userId) {
        try {
            candidateRepository.findByUserId(userId).ifPresent(candidate -> {
                Long candidateId = candidate.getCandidateId();
                attendanceRepository.deleteByCandidateCandidateId(candidateId);
                drivingLessonRepository.deleteByCandidateCandidateId(candidateId);
                theoryLessonRepository.deleteByCandidateCandidateId(candidateId);
                feedbackRepository.deleteByCandidateCandidateId(candidateId);
                lessonRepository.deleteByCandidateCandidateId(candidateId);
                trainingPhaseRepository.deleteByCandidateCandidateId(candidateId);
                theoryPlanRepository.removeCandidateFromAllPlans(candidateId);
                candidateRepository.delete(candidate);
                log.info("Kandidat i svi povezani podaci obrisani za userId: {}", userId);
            });

            instructorRepository.findByUserId(userId).ifPresent(instructor -> {
                Long instructorId = instructor.getInstructorId();
                candidateRepository.unassignInstructor(instructor);
                feedbackRepository.deleteByInstructorInstructorId(instructorId);
                lessonRepository.deleteByInstructorInstructorId(instructorId);
                instructorRepository.delete(instructor);
                log.info("Instruktor, časovi i feedback obrisani za userId: {}", userId);
            });
        } catch (Exception e) {
            log.error("Greška pri brisanju podataka za userId {}: {}", userId, e.getMessage());
        }
    }
}
