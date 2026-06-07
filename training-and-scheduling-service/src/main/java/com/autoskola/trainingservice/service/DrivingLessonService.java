package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.DrivingLesson;
import com.autoskola.trainingservice.model.TrainingPhase;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.DrivingLessonRepository;
import com.autoskola.trainingservice.repository.TheoryLessonRepository;
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
    private final TheoryLessonRepository theoryLessonRepository;

    public DrivingLessonService(DrivingLessonRepository drivingLessonRepository,
                                CandidateRepository candidateRepository,
                                TrainingPhaseRepository trainingPhaseRepository,
                                TheoryLessonRepository theoryLessonRepository) {
        this.drivingLessonRepository = drivingLessonRepository;
        this.candidateRepository = candidateRepository;
        this.trainingPhaseRepository = trainingPhaseRepository;
        this.theoryLessonRepository = theoryLessonRepository;
    }

    public List<DrivingLesson> getLessonsForCandidate(Long candidateId) {
        return drivingLessonRepository.findByCandidateCandidateIdOrderByLessonNumber(candidateId);
    }

    @Transactional
    public DrivingLesson addLesson(Long candidateId, Integer lessonNumber, LocalDate date, String notes) {
        if (drivingLessonRepository.findByCandidateCandidateIdAndLessonNumber(candidateId, lessonNumber).isPresent()) {
            throw new IllegalArgumentException("Čas broj " + lessonNumber + " već postoji za ovog kandidata.");
        }
        boolean theoryExamPassed =
                trainingPhaseRepository.findByCandidateCandidateIdAndPhaseTypeIgnoreCase(candidateId, "TEORIJSKI ISPIT")
                        .stream().anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()))
                || trainingPhaseRepository.findByCandidateCandidateIdAndPhaseTypeIgnoreCase(candidateId, "TEORIJSKI DIO")
                        .stream().anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()))
                || theoryLessonRepository.countByCandidateCandidateIdAndCompletedTrue(candidateId) >= 40;

        if (!theoryExamPassed) {
            throw new IllegalArgumentException("Kandidat mora položiti teorijski ispit prije nego što može zakazati čas vožnje.");
        }


        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new IllegalArgumentException("Kandidat sa ID-om " + candidateId + " nije pronađen."));

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