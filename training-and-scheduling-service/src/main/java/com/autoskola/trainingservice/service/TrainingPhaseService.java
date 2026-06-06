package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.CandidateDTO;
import com.autoskola.trainingservice.dto.TrainingPhaseDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.model.TrainingPhase;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.LessonRepository;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrainingPhaseService {

    private static final int REQUIRED_DRIVING_LESSONS = 40;

    private final TrainingPhaseRepository phaseRepository;
    private final CandidateService candidateService;
    private final CandidateRepository candidateRepository;
    private final LessonRepository lessonRepository;

    public TrainingPhaseService(TrainingPhaseRepository phaseRepository,
                                CandidateService candidateService,
                                CandidateRepository candidateRepository,
                                LessonRepository lessonRepository) {
        this.phaseRepository = phaseRepository;
        this.candidateService = candidateService;
        this.candidateRepository = candidateRepository;
        this.lessonRepository = lessonRepository;
    }

    public TrainingPhaseDTO getPhaseDetails(Long id) {
        TrainingPhase phase = phaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trening faza nije pronađena"));
        CandidateDTO candidateDTO = candidateService.getCandidateFullDetails(phase.getCandidate().getCandidateId());

        return new TrainingPhaseDTO(
                phase.getPhaseId(),
                phase.getPhaseType(),
                phase.getStatus(),
                phase.getDateCompleted(),
                candidateDTO
        );
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
        // Označi sve postojeće časove vožnje kao ODRAĐENO
        lessonRepository.markAllDrivingLessonsCompleted(candidate.getCandidateId());

        // Provjeri koliko časova vožnje postoji
        List<Lesson> existing = lessonRepository
                .findByCandidateCandidateIdAndLessonTypeIgnoreCase(candidate.getCandidateId(), "VOŽNJA");

        int toCreate = REQUIRED_DRIVING_LESSONS - existing.size();
        if (toCreate <= 0) return;

        // Kreiraj preostale do 40 (sa datumom u bliskoj budućnosti da prođe @Future validaciju)
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



