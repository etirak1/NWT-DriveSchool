package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.client.FinanceClient;
import com.autoskola.trainingservice.dto.CandidateDTO;
import com.autoskola.trainingservice.dto.CandidateFinanceStatusDTO;
import com.autoskola.trainingservice.dto.PhaseStatusDTO;
import com.autoskola.trainingservice.dto.TrainingPhaseDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.model.TrainingPhase;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.DrivingLessonRepository;
import com.autoskola.trainingservice.repository.LessonRepository;
import com.autoskola.trainingservice.repository.TheoryLessonRepository;
import com.autoskola.trainingservice.repository.TheorySessionAttendanceRepository;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TrainingPhaseService {

    private static final int REQUIRED_THEORY_LESSONS = 40;
    private static final int REQUIRED_DRIVING_LESSONS = 40;
    private static final Logger log = LoggerFactory.getLogger(TrainingPhaseService.class);

    private final TrainingPhaseRepository phaseRepository;
    private final CandidateService candidateService;
    private final CandidateRepository candidateRepository;
    private final LessonRepository lessonRepository;
    private final TheoryLessonRepository theoryLessonRepository;
    private final TheorySessionAttendanceRepository attendanceRepository;
    private final DrivingLessonRepository drivingLessonRepository;
    private final FinanceClient financeClient;

    public TrainingPhaseService(TrainingPhaseRepository phaseRepository,
                                CandidateService candidateService,
                                CandidateRepository candidateRepository,
                                LessonRepository lessonRepository,
                                TheoryLessonRepository theoryLessonRepository,
                                TheorySessionAttendanceRepository attendanceRepository,
                                DrivingLessonRepository drivingLessonRepository,
                                FinanceClient financeClient) {
        this.phaseRepository = phaseRepository;
        this.candidateService = candidateService;
        this.candidateRepository = candidateRepository;
        this.lessonRepository = lessonRepository;
        this.theoryLessonRepository = theoryLessonRepository;
        this.attendanceRepository = attendanceRepository;
        this.drivingLessonRepository = drivingLessonRepository;
        this.financeClient = financeClient;
    }


    public List<PhaseStatusDTO> getTimeline(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));

        int theoryRequired = REQUIRED_THEORY_LESSONS;
        int drivingRequired = (candidate.getRule() != null && candidate.getRule().getMinPracticalLessons() != null)
                ? candidate.getRule().getMinPracticalLessons()
                : REQUIRED_DRIVING_LESSONS;

        PhaseStatusDTO upis = new PhaseStatusDTO();
        upis.setKey("UPIS");
        upis.setLabel("Upis / Administracija");
        upis.setStatus("ZAVRŠENO");
        upis.setProgress(candidate.getEnrollmentDate() != null
                ? "Upisano " + candidate.getEnrollmentDate() : null);

        long theoryDone = attendanceRepository.sumAttendedLessonsByCandidate(candidateId);
        PhaseStatusDTO teorija = new PhaseStatusDTO();
        teorija.setKey("TEORIJA");
        teorija.setLabel("Teorijska nastava");
        teorija.setProgress(theoryDone + "/" + theoryRequired + " časova");
        if (theoryDone >= theoryRequired) {
            teorija.setStatus("ZAVRŠENO");
        } else if (theoryDone > 0) {
            teorija.setStatus("U TOKU");
        } else {
            teorija.setStatus("NIJE ZAPOČETO");
        }
        boolean theoryComplete = theoryDone >= theoryRequired;

        Optional<TrainingPhase> theoryExamOpt = phaseRepository
                .findByCandidateCandidateIdAndPhaseTypeIgnoreCase(candidateId, "TEORIJSKI ISPIT")
                .stream().findFirst();
        PhaseStatusDTO teorijskiIspit = buildExamPhase(
                "TEORIJSKI_ISPIT", "Teorijski ispit", theoryComplete, theoryExamOpt);

        boolean theoryExamPassed = theoryExamOpt
                .map(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus())).orElse(false);

        long drivingDone = drivingLessonRepository.countByCandidateCandidateId(candidateId);
        PhaseStatusDTO voznja = new PhaseStatusDTO();
        voznja.setKey("VOZNJA");
        voznja.setLabel("Praktična obuka / Vožnja");
        if (!theoryExamPassed) {
            voznja.setStatus("ZAKLJUČANO");
        } else {
            voznja.setProgress(drivingDone + "/" + drivingRequired + " časova");
            if (drivingDone >= drivingRequired) {
                voznja.setStatus("ZAVRŠENO");
            } else if (drivingDone > 0) {
                voznja.setStatus("U TOKU");
            } else {
                voznja.setStatus("NIJE ZAPOČETO");
            }
        }
        boolean drivingComplete = theoryExamPassed && drivingDone >= drivingRequired;

        Optional<TrainingPhase> practicalExamOpt = phaseRepository
                .findByCandidateCandidateIdAndPhaseTypeIgnoreCase(candidateId, "PRAKTIČNI ISPIT")
                .stream().findFirst();
        PhaseStatusDTO prakticniIspit = buildExamPhase(
                "PRAKTICNI_ISPIT", "Praktični ispit", drivingComplete, practicalExamOpt);

        boolean practicalExamPassed = practicalExamOpt
                .map(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus())).orElse(false);

        PhaseStatusDTO zavrseno = new PhaseStatusDTO();
        zavrseno.setKey("ZAVRSENO");
        zavrseno.setLabel("Obuka završena");
        zavrseno.setStatus(practicalExamPassed ? "ZAVRŠENO" : "ZAKLJUČANO");

        return List.of(upis, teorija, teorijskiIspit, voznja, prakticniIspit, zavrseno);
    }

    private PhaseStatusDTO buildExamPhase(String key, String label,
                                           boolean unlocked, Optional<TrainingPhase> phaseOpt) {
        PhaseStatusDTO dto = new PhaseStatusDTO();
        dto.setKey(key);
        dto.setLabel(label);
        if (!unlocked) {
            dto.setStatus("ZAKLJUČANO");
            return dto;
        }
        if (phaseOpt.isEmpty()) {
            dto.setStatus("NIJE ZAPOČETO");
            return dto;
        }
        TrainingPhase p = phaseOpt.get();
        dto.setPhaseId(p.getPhaseId());
        dto.setExamStatus(p.getStatus());
        dto.setExamDate(p.getDateCompleted());
        dto.setNotes(p.getNotes());
        dto.setStatus("POLOŽENO".equalsIgnoreCase(p.getStatus()) ? "ZAVRŠENO" : "U TOKU");
        return dto;
    }


    @Transactional
    public PhaseStatusDTO upsertExamPhase(Long candidateId, String phaseType,
                                           String status, LocalDate examDate, String notes) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));

        if ("PRAKTIČNI ISPIT".equalsIgnoreCase(phaseType)) {
            try {
                CandidateFinanceStatusDTO financeStatus = financeClient.getFinanceStatus(candidateId);
                if (!financeStatus.isExamEligible()) {
                    throw new IllegalArgumentException(
                            "Kandidat nije izmirio sve finansijske obaveze. " +
                            "Preostali dug: " + financeStatus.getRemainingDebt() + " KM."
                    );
                }
            } catch (IllegalArgumentException e) {
                throw e; // propagiraj validacionu grešku
            } catch (Exception e) {
                log.warn("Nije moguće provjeriti finansijski status kandidata {}: {}", candidateId, e.getMessage());
                // Ako finance-service nije dostupan, ne blokiraj (graceful degradation)
            }
        }

        List<TrainingPhase> existing = phaseRepository
                .findByCandidateCandidateIdAndPhaseTypeIgnoreCase(candidateId, phaseType);

        TrainingPhase phase;
        if (!existing.isEmpty()) {
            phase = existing.get(0);
        } else {
            phase = new TrainingPhase();
            phase.setCandidate(candidate);
            phase.setPhaseType(phaseType);
        }

        if (status != null) phase.setStatus(status);
        if (examDate != null) {
            boolean isCompleted = "POLOŽENO".equalsIgnoreCase(status != null ? status : phase.getStatus())
                    || "NEPOLOŽENO".equalsIgnoreCase(status != null ? status : phase.getStatus());
            if (isCompleted && examDate.isAfter(java.time.LocalDate.now())) {
                throw new IllegalArgumentException("Datum ispita ne može biti u budućnosti za status 'Položeno' ili 'Nije položio'.");
            }
            phase.setDateCompleted(examDate);
        }
        if (notes != null) phase.setNotes(notes);

        phaseRepository.save(phase);

        return getTimeline(candidateId).stream()
                .filter(p -> p.getPhaseId() != null && p.getPhaseId().equals(phase.getPhaseId()))
                .findFirst()
                .orElse(null);
    }


    public TrainingPhaseDTO getPhaseDetails(Long id) {
        TrainingPhase phase = phaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trening faza nije pronađena"));
        CandidateDTO candidateDTO = candidateService.getCandidateFullDetails(phase.getCandidate().getCandidateId());
        return new TrainingPhaseDTO(phase.getPhaseId(), phase.getPhaseType(), phase.getStatus(),
                phase.getDateCompleted(), candidateDTO);
    }

    @Transactional
    public TrainingPhaseDTO createPhase(TrainingPhase phase) {
        Long candidateId = phase.getCandidate().getCandidateId();
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));
        phase.setCandidate(candidate);
        TrainingPhase savedPhase = phaseRepository.save(phase);

        if ("PRAKTIČNA VOŽNJA".equalsIgnoreCase(phase.getPhaseType())
                && "POLOŽENO".equalsIgnoreCase(phase.getStatus())) {
            completeDrivingLessons(candidate);
        }
        return getPhaseDetails(savedPhase.getPhaseId());
    }

    private void completeDrivingLessons(Candidate candidate) {
        lessonRepository.markAllDrivingLessonsCompleted(candidate.getCandidateId());
        List<Lesson> existing = lessonRepository
                .findByCandidateCandidateIdAndLessonTypeIgnoreCase(candidate.getCandidateId(), "VOŽNJA");
        int toCreate = REQUIRED_DRIVING_LESSONS - existing.size();
        if (toCreate <= 0) return;
        List<Lesson> newLessons = new ArrayList<>();
        for (int i = 0; i < toCreate; i++) {
            Lesson lesson = new Lesson();
            lesson.setCandidate(candidate);
            lesson.setInstructor(candidate.getAssignedInstructor());
            lesson.setDateTime(LocalDateTime.now().plusSeconds(i + 1));
            lesson.setDuration(45);
            lesson.setStatus("ODRAĐENO");
            lesson.setLessonType("VOŽNJA");
            lesson.setNotes("Auto-generisan pri položenoj praktičnoj vožnji");
            newLessons.add(lesson);
        }
        lessonRepository.saveAll(newLessons);
    }

    public List<TrainingPhaseDTO> getAllPhases() {
        return phaseRepository.findAll().stream()
                .map(phase -> getPhaseDetails(phase.getPhaseId()))
                .collect(Collectors.toList());
    }
}
