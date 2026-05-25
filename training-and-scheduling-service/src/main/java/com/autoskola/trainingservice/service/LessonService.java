package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.LessonDTO;
import com.autoskola.trainingservice.client.UserClient;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.dto.LessonEvent;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.LessonRepository;
import com.autoskola.trainingservice.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final UserClient userClient;
    private final CandidateRepository candidateRepository;
    private final RabbitTemplate rabbitTemplate;

    public LessonService(LessonRepository lessonRepository,
                         UserClient userClient,
                         CandidateRepository candidateRepository,
                         RabbitTemplate rabbitTemplate) {
        this.lessonRepository = lessonRepository;
        this.userClient = userClient;
        this.candidateRepository = candidateRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    private UserDTO safeGetUser(Long userId, String fallbackRole) {
        if (userId == null) {
            return new UserDTO(null, "Nepoznato", "Korisnik", fallbackRole);
        }
        try {
            UserDTO dto = userClient.getUserById(userId);
            System.out.println("safeGetUser uspješno: " + userId + " -> " + dto.getFirstName());
            return dto;
        } catch (Exception e) {
            System.out.println("safeGetUser PALO za userId=" + userId + ", greška: " + e.getMessage());
            return new UserDTO(userId, "Nepoznato", "Korisnik", fallbackRole);
        }
    }

    public LessonDTO getLessonDetails(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Čas nije pronađen"));

        UserDTO instructorUser = safeGetUser(lesson.getInstructor().getUserId(), "INSTRUCTOR");
        UserDTO candidateUser  = safeGetUser(lesson.getCandidate().getUserId(),  "CANDIDATE");

        return new LessonDTO(lesson, instructorUser, candidateUser);
    }

    public LessonDTO saveLesson(Lesson lesson) {
        // Kandidata tražimo po userId iz request body-a
        Candidate candidate = candidateRepository.findByUserId(lesson.getCandidate().getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "Kandidat sa userId=" + lesson.getCandidate().getUserId() + " ne postoji."));

        // Instruktor se ne šalje u requestu — uzimamo ga direktno iz kandidatovog profila
        Instructor instructor = candidate.getAssignedInstructor();
        if (instructor == null) {
            throw new RuntimeException(
                    "Kandidat nema dodijeljen instruktor. Molimo odaberite instruktora prije zakazivanja časa.");
        }

        if (instructor.getAssignedVehicleId() == null) {
            throw new RuntimeException(
                    "Instruktor nema dodijeljeno vozilo. Kontaktirajte administratora.");
        }

        if (!"ACTIVE".equalsIgnoreCase(instructor.getVehicleStatus())) {
            throw new RuntimeException(
                    "Vozilo instruktora trenutno nije raspoloživo (status: "
                            + instructor.getVehicleStatus() + ").");
        }

        lesson.setVehicleId(instructor.getAssignedVehicleId());

        if (lesson.getDuration() == null) {
            lesson.setDuration(45);
        }

        java.time.LocalDateTime newStart = lesson.getDateTime();
        java.time.LocalDateTime newEnd = newStart.plusMinutes(lesson.getDuration());

        List<Lesson> instructorConflicts = lessonRepository
                .findOverlappingInstructorLessons(instructor.getInstructorId(), newStart, newEnd);
        if (!instructorConflicts.isEmpty()) {
            throw new RuntimeException("Instruktor već ima zakazan čas u tom terminu.");
        }

        List<Lesson> vehicleConflicts = lessonRepository
                .findOverlappingVehicleLessons(lesson.getVehicleId(), newStart, newEnd);
        if (!vehicleConflicts.isEmpty()) {
            throw new RuntimeException("Vozilo je već zauzeto u tom terminu.");
        }

        lesson.setCandidate(candidate);
        lesson.setInstructor(instructor);
        lesson.setStatus("ZAKAZANO");

        Lesson savedLesson = lessonRepository.save(lesson);

        LessonEvent event = new LessonEvent();
        event.setLessonId(savedLesson.getLessonId());
        event.setCandidateId(candidate.getCandidateId());
        event.setStatus("ZAKAZANO");

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "lesson.created", event);

        return getLessonDetails(savedLesson.getLessonId());
    }

    public List<LessonDTO> getInstructorScheduleForDay(Long instructorId, java.time.LocalDate date) {
        java.time.LocalDateTime dayStart = date.atStartOfDay();
        java.time.LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

        List<Lesson> lessons = lessonRepository
                .findInstructorLessonsForDay(instructorId, dayStart, dayEnd);

        List<LessonDTO> result = new ArrayList<>();
        for (Lesson l : lessons) {
            UserDTO inst = safeGetUser(l.getInstructor().getUserId(), "INSTRUCTOR");
            UserDTO cand = safeGetUser(l.getCandidate().getUserId(), "CANDIDATE");
            result.add(new LessonDTO(l, inst, cand));
        }
        return result;
    }

    public List<LessonDTO> getAllLessons() {
        List<Lesson> lessons = lessonRepository.findAll();
        List<LessonDTO> response = new ArrayList<>();

        for (Lesson l : lessons) {
            UserDTO inst = safeGetUser(l.getInstructor().getUserId(), "INSTRUCTOR");
            UserDTO cand = safeGetUser(l.getCandidate().getUserId(),  "CANDIDATE");
            response.add(new LessonDTO(l, inst, cand));
        }

        return response;
    }

    @Transactional
    public String completeLessonAndIncreaseProgress(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Čas nije pronađen"));

        if (!"ZAKAZANO".equalsIgnoreCase(lesson.getStatus())) {
            throw new RuntimeException("Samo zakazani časovi se mogu označiti kao završeni.");
        }

        lesson.setStatus("ODRAĐENO");
        lessonRepository.save(lesson);

        Candidate candidate = lesson.getCandidate();
        BigDecimal currentProgress = candidate.getProgressPercentage();
        if (currentProgress == null) currentProgress = BigDecimal.ZERO;

        BigDecimal newProgress = currentProgress.add(new BigDecimal("2.5"));
        if (newProgress.compareTo(new BigDecimal("100")) > 0) {
            newProgress = new BigDecimal("100");
        }

        candidate.setProgressPercentage(newProgress);
        candidateRepository.save(candidate);

        return "Čas ID " + lessonId + " je završen. Progres kandidata " +
                candidate.getCandidateId() + " je sada " + newProgress + "%";
    }

    public Page<LessonDTO> getAllLessonsPaged(Pageable pageable) {
        return lessonRepository.findAll(pageable)
                .map(lesson -> {
                    UserDTO inst = safeGetUser(lesson.getInstructor().getUserId(), "INSTRUCTOR");
                    UserDTO cand = safeGetUser(lesson.getCandidate().getUserId(),  "CANDIDATE");
                    return new LessonDTO(lesson, inst, cand);
                });
    }

    public LessonDTO patchLessonNotes(Long id, String newNotes) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Čas nije pronađen"));

        lesson.setNotes(newNotes);
        Lesson saved = lessonRepository.save(lesson);

        return getLessonDetails(saved.getLessonId());
    }

    public boolean hasActiveSessions(Long userId) {
        return !lessonRepository.findUpcomingByInstructorUserId(userId).isEmpty();
    }

    public Page<LessonDTO> getLessonsByUserId(Long userId, Pageable pageable) {
        return lessonRepository.findByCandidateUserId(userId, pageable)
                .map(lesson -> {
                    UserDTO inst = safeGetUser(lesson.getInstructor().getUserId(), "INSTRUCTOR");
                    UserDTO cand = safeGetUser(lesson.getCandidate().getUserId(), "CANDIDATE");
                    return new LessonDTO(lesson, inst, cand);
                });
    }
}