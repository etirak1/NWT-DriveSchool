package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.LessonDTO;
import com.autoskola.trainingservice.client.UserClient;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.dto.LessonEvent;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.model.DrivingLesson;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.DrivingLessonRepository;
import com.autoskola.trainingservice.repository.LessonRepository;
import com.autoskola.trainingservice.config.RabbitMQConfig;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private final TrainingPhaseRepository phaseRepository;
    private final DrivingLessonRepository drivingLessonRepository;

    public LessonService(LessonRepository lessonRepository,
                         UserClient userClient,
                         CandidateRepository candidateRepository,
                         RabbitTemplate rabbitTemplate,
                         TrainingPhaseRepository phaseRepository,
                         DrivingLessonRepository drivingLessonRepository) {
        this.lessonRepository = lessonRepository;
        this.userClient = userClient;
        this.candidateRepository = candidateRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.phaseRepository = phaseRepository;
        this.drivingLessonRepository = drivingLessonRepository;
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
        if (lesson.getDateTime() == null || !lesson.getDateTime().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Čas se mora zakazati za budući termin.");
        }

        Candidate candidate = candidateRepository.findByUserId(lesson.getCandidate().getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "Kandidat sa userId=" + lesson.getCandidate().getUserId() + " ne postoji."));

        String tip = lesson.getLessonType() == null ? "" : lesson.getLessonType().toUpperCase();
        if ("VOŽNJA".equals(tip)) {
            boolean polozenaTeorija =
                    phaseRepository.findByCandidateCandidateIdAndPhaseTypeIgnoreCase(
                                    candidate.getCandidateId(), "TEORIJSKI DIO")
                            .stream().anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()))
                    || phaseRepository.findByCandidateCandidateIdAndPhaseTypeIgnoreCase(
                                    candidate.getCandidateId(), "TEORIJSKI ISPIT")
                            .stream().anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()));

            if (!polozenaTeorija) {
                throw new RuntimeException(
                        "Ne možete zakazati čas vožnje dok ne položite teorijski ispit.");
            }

            Integer limit = (candidate.getRule() != null && candidate.getRule().getMaxLessonsPerWeek() != null)
                    ? candidate.getRule().getMaxLessonsPerWeek() : 4;

            java.time.LocalDate today = lesson.getDateTime().toLocalDate();
            java.time.LocalDate weekStart = today.with(java.time.DayOfWeek.MONDAY);
            java.time.LocalDateTime ws = weekStart.atStartOfDay();
            java.time.LocalDateTime we = weekStart.plusDays(7).atStartOfDay();

            long brojCasovaUSedmici = lessonRepository
                    .countDrivingLessonsInWeek(candidate.getCandidateId(), ws, we);

            if (brojCasovaUSedmici >= limit) {
                throw new RuntimeException(
                        "Dostigli ste sedmični limit od " + limit + " časova vožnje. " +
                                "Pokušajte zakazati za sljedeću sedmicu.");
            }
        }

        Instructor instructor = candidate.getAssignedInstructor();
        if (instructor == null) {
            throw new RuntimeException(
                    "Kandidat nema dodijeljen instruktor. Molimo odaberite instruktora prije zakazivanja časa.");
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

        if (lesson.getVehicleId() != null) {
            List<Lesson> vehicleConflicts = lessonRepository
                    .findOverlappingVehicleLessons(lesson.getVehicleId(), newStart, newEnd);
            if (!vehicleConflicts.isEmpty()) {
                throw new RuntimeException("Vozilo je već zauzeto u tom terminu.");
            }
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
    public String completeLessonAndIncreaseProgress(Long lessonId, String topicCovered, String teacherNotes) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Čas nije pronađen"));

        if (!"ZAKAZANO".equalsIgnoreCase(lesson.getStatus())) {
            throw new RuntimeException("Samo zakazani časovi se mogu označiti kao završeni.");
        }

        String newTopic = (topicCovered != null && !topicCovered.isBlank()) ? topicCovered : lesson.getTopic();
        String newNotes = (teacherNotes != null && !teacherNotes.isBlank()) ? teacherNotes : lesson.getNotes();
        lessonRepository.completeLesson(lessonId, newTopic, newNotes);
        // Refresh entity state after direct query update
        lesson.setStatus("ODRAĐENO");
        lesson.setTopic(newTopic);
        lesson.setNotes(newNotes);

        if ("VOŽNJA".equalsIgnoreCase(lesson.getLessonType())) {
            Candidate candidate = lesson.getCandidate();
            long existingCount = drivingLessonRepository.countByCandidateCandidateId(candidate.getCandidateId());
            int nextNumber = (int) existingCount + 1;
            boolean alreadyExists = drivingLessonRepository
                    .findByCandidateCandidateIdAndLessonNumber(candidate.getCandidateId(), nextNumber)
                    .isPresent();
            if (!alreadyExists && nextNumber <= 40) {
                String notes = lesson.getNotes() != null ? lesson.getNotes()
                        : (lesson.getTopic() != null ? lesson.getTopic() : null);
                drivingLessonRepository.save(new DrivingLesson(
                        candidate, nextNumber,
                        lesson.getDateTime().toLocalDate(),
                        notes));
            }
        }

        return "Čas uspješno završen";


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


    public java.util.Map<String, Object> getBookingEligibility(Long userId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Kandidat ne postoji"));

        List<com.autoskola.trainingservice.model.TrainingPhase> teorija =
                phaseRepository.findByCandidateCandidateIdAndPhaseTypeIgnoreCase(
                        candidate.getCandidateId(), "TEORIJSKI DIO");

        boolean theoryPassed = teorija.stream()
                .anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()));

        Integer limit = (candidate.getRule() != null && candidate.getRule().getMaxLessonsPerWeek() != null)
                ? candidate.getRule().getMaxLessonsPerWeek() : 4;

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate weekStart = today.with(java.time.DayOfWeek.MONDAY);
        long inWeek = lessonRepository.countDrivingLessonsInWeek(
                candidate.getCandidateId(),
                weekStart.atStartOfDay(),
                weekStart.plusDays(7).atStartOfDay());

        java.util.Map<String, Object> r = new java.util.HashMap<>();
        r.put("theoryPassed", theoryPassed);
        r.put("weeklyLimit", limit);
        r.put("lessonsThisWeek", inWeek);
        r.put("canBook", theoryPassed && inWeek < limit);
        return r;
    }

    public Page<LessonDTO> getLessonsByInstructorUserId(Long userId, Pageable pageable) {
        return lessonRepository.findByInstructorUserId(userId, pageable)
                .map(lesson -> {
                    UserDTO inst = safeGetUser(lesson.getInstructor().getUserId(), "INSTRUCTOR");
                    UserDTO cand = safeGetUser(lesson.getCandidate().getUserId(), "CANDIDATE");
                    return new LessonDTO(lesson, inst, cand);
                });
    }
    @Transactional
    public LessonDTO proposeLesson(Long candidateId, LocalDateTime dateTime, Integer duration, String notes) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));

        Instructor instructor = candidate.getAssignedInstructor();
        if (instructor == null) {
            throw new RuntimeException("Kandidat nema dodijeljen instruktor.");
        }

        int dur = (duration != null && duration > 0) ? duration : 45;
        LocalDateTime endTime = dateTime.plusMinutes(dur);

        List<Lesson> instructorConflicts = lessonRepository
                .findOverlappingInstructorLessons(instructor.getInstructorId(), dateTime, endTime);
        if (!instructorConflicts.isEmpty()) {
            throw new RuntimeException("Instruktor već ima zakazan čas u tom terminu.");
        }

        Long vehicleId = instructor.getAssignedVehicleId();
        if (vehicleId != null) {
            List<Lesson> vehicleConflicts = lessonRepository
                    .findOverlappingVehicleLessons(vehicleId, dateTime, endTime);
            if (!vehicleConflicts.isEmpty()) {
                throw new RuntimeException("Vozilo je već zauzeto u tom terminu.");
            }
        }

        Lesson lesson = new Lesson();
        lesson.setCandidate(candidate);
        lesson.setInstructor(instructor);
        lesson.setVehicleId(vehicleId);
        lesson.setDateTime(dateTime);
        lesson.setDuration(dur);
        lesson.setStatus("PENDING");
        lesson.setLessonType("VOŽNJA");
        lesson.setNotes(notes);

        Lesson saved = lessonRepository.save(lesson);
        return getLessonDetails(saved.getLessonId());
    }

    @Transactional
    public LessonDTO confirmLesson(Long lessonId, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Čas nije pronađen"));

        if (!"PENDING".equalsIgnoreCase(lesson.getStatus())) {
            throw new RuntimeException("Može se potvrditi samo čas koji čeka potvrdu.");
        }
        if (!lesson.getCandidate().getUserId().equals(userId)) {
            throw new RuntimeException("Nemate dozvolu za potvrdu ovog časa.");
        }

        lesson.setStatus("ZAKAZANO");
        lessonRepository.save(lesson);
        return getLessonDetails(lessonId);
    }

    @Transactional
    public LessonDTO rejectLesson(Long lessonId, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Čas nije pronađen"));

        if (!"PENDING".equalsIgnoreCase(lesson.getStatus())) {
            throw new RuntimeException("Može se odbiti samo čas koji čeka potvrdu.");
        }
        if (!lesson.getCandidate().getUserId().equals(userId)) {
            throw new RuntimeException("Nemate dozvolu za odbijanje ovog časa.");
        }

        lesson.setStatus("OTKAZANO");
        lessonRepository.save(lesson);
        return getLessonDetails(lessonId);
    }

    public List<LessonDTO> getPendingForCandidate(Long userId) {
        return lessonRepository.findPendingByCandidate(userId).stream()
                .map(l -> {
                    UserDTO inst = safeGetUser(l.getInstructor().getUserId(), "INSTRUCTOR");
                    UserDTO cand = safeGetUser(l.getCandidate().getUserId(), "CANDIDATE");
                    return new LessonDTO(l, inst, cand);
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public LessonDTO rescheduleLesson(Long lessonId, LocalDateTime newDateTime, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Čas nije pronađen"));

        if (!lesson.getCandidate().getUserId().equals(userId)) {
            throw new RuntimeException("Nemate dozvolu za izmjenu ovog časa.");
        }

        if (!"ZAKAZANO".equalsIgnoreCase(lesson.getStatus())) {
            throw new RuntimeException("Može se pomjeriti samo zakazani čas.");
        }

        if (!newDateTime.isAfter(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Novi termin mora biti u budućnosti.");
        }

        Instructor instructor = lesson.getInstructor();
        java.time.LocalDateTime newEnd = newDateTime.plusMinutes(lesson.getDuration());

        List<Lesson> conflicts = lessonRepository
                .findOverlappingInstructorLessons(instructor.getInstructorId(), newDateTime, newEnd)
                .stream()
                .filter(l -> !l.getLessonId().equals(lessonId))
                .collect(java.util.stream.Collectors.toList());

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Instruktor već ima zakazan čas u tom terminu.");
        }

        if (lesson.getVehicleId() != null) {
            List<Lesson> vehicleConflicts = lessonRepository
                    .findOverlappingVehicleLessons(lesson.getVehicleId(), newDateTime, newEnd)
                    .stream()
                    .filter(l -> !l.getLessonId().equals(lessonId))
                    .collect(java.util.stream.Collectors.toList());

            if (!vehicleConflicts.isEmpty()) {
                throw new RuntimeException("Vozilo je već zauzeto u tom terminu.");
            }
        }

        lesson.setDateTime(newDateTime);
        lessonRepository.save(lesson);

        return getLessonDetails(lessonId);
    }






}