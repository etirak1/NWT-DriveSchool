package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.LessonDTO;
import com.autoskola.trainingservice.client.UserClient;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.dto.LessonEvent;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
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
    private final InstructorRepository instructorRepository;
    private final RabbitTemplate rabbitTemplate;

    // POPRAVLJEN KONSTRUKTOR (Ovdje si imala grešku sa dva RabbitTemplate-a)
    public LessonService(LessonRepository lessonRepository,
                          UserClient userClient,
                         CandidateRepository candidateRepository,
                         InstructorRepository instructorRepository,
                         RabbitTemplate rabbitTemplate) {
        this.lessonRepository = lessonRepository;
        this.userClient = userClient;
        this.candidateRepository = candidateRepository;
        this.instructorRepository = instructorRepository;
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

        return new LessonDTO(
                lesson,
                instructorUser,
                candidateUser
        );
    }

    public LessonDTO saveLesson(Lesson lesson) {
        Candidate candidate = candidateRepository.findById(lesson.getCandidate().getCandidateId())
                .orElseThrow(() -> new RuntimeException("Kandidat sa ID-om " + lesson.getCandidate().getCandidateId() + " ne postoji."));

        Instructor instructor = instructorRepository.findById(lesson.getInstructor().getInstructorId())
                .orElseThrow(() -> new RuntimeException("Instruktor sa ID-om " + lesson.getInstructor().getInstructorId() + " ne postoji."));

        lesson.setCandidate(candidate);
        lesson.setInstructor(instructor);

        lesson.setStatus("PENDING");
        Lesson savedLesson = lessonRepository.save(lesson);

        LessonEvent event = new LessonEvent();
        event.setLessonId(savedLesson.getLessonId());
        event.setCandidateId(candidate.getCandidateId());
        event.setStatus("PENDING");

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "lesson.created", event);

        return getLessonDetails(savedLesson.getLessonId());
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