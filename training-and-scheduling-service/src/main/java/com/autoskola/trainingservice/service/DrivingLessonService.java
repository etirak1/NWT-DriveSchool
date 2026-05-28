package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.DrivingLesson;
import com.autoskola.trainingservice.model.TrainingPhase;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.DrivingLessonRepository;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.util.List;

@Service
public class DrivingLessonService {

    private final DrivingLessonRepository drivingLessonRepository;
    private final CandidateRepository candidateRepository;
    private final TrainingPhaseRepository trainingPhaseRepository;

    public DrivingLessonService(DrivingLessonRepository drivingLessonRepository,
                                CandidateRepository candidateRepository,
                                TrainingPhaseRepository trainingPhaseRepository) {
        this.drivingLessonRepository = drivingLessonRepository;
        this.candidateRepository = candidateRepository;
        this.trainingPhaseRepository = trainingPhaseRepository;
    }

    public List<DrivingLesson> getLessonsForCandidate(Long candidateId) {
        return drivingLessonRepository.findByCandidateCandidateIdOrderByLessonNumber(candidateId);
    }

    @Transactional
    public DrivingLesson addLesson(Long candidateId, Integer lessonNumber, LocalDate date, String notes) {
        if (drivingLessonRepository.findByCandidateCandidateIdAndLessonNumber(candidateId, lessonNumber).isPresent()) {
            throw new IllegalArgumentException("Čas broj " + lessonNumber + " već postoji za ovog kandidata.");
        }

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen."));

        DrivingLesson lesson = new DrivingLesson(candidate, lessonNumber, date, notes);
        DrivingLesson saved = drivingLessonRepository.save(lesson);

        updateDrivingPhase(candidateId);

        return saved;
    }

    @Transactional
    public void deleteLesson(Long candidateId, Integer lessonNumber) {
        DrivingLesson lesson = drivingLessonRepository
                .findByCandidateCandidateIdAndLessonNumber(candidateId, lessonNumber)
                .orElseThrow(() -> new RuntimeException("Čas nije pronađen."));
        drivingLessonRepository.delete(lesson);
        updateDrivingPhase(candidateId);
    }

    public long getCompletedCount(Long candidateId) {
        return drivingLessonRepository.countByCandidateCandidateId(candidateId);
    }

    private void updateDrivingPhase(Long candidateId) {
        long count = drivingLessonRepository.countByCandidateCandidateId(candidateId);

        List<TrainingPhase> phases = trainingPhaseRepository
                .findByCandidateCandidateIdAndPhaseTypeIgnoreCase(candidateId, "PRAKTIČNA VOŽNJA");

        if (!phases.isEmpty()) {
            TrainingPhase phase = phases.get(0);
            if (count >= 40) {
                phase.setStatus("POLOŽENO");
            } else if (count > 0) {
                phase.setStatus("U TOKU");
            }
            trainingPhaseRepository.save(phase);
        }
    }



}