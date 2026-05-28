package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.TheoryLesson;
import com.autoskola.trainingservice.model.TrainingPhase;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.TheoryLessonRepository;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


@Service
public class TheoryLessonService {

    private static final int TOTAL_LESSONS = 40;

    private final TheoryLessonRepository theoryLessonRepository;
    private final CandidateRepository candidateRepository;
    private final TrainingPhaseRepository trainingPhaseRepository;

    public TheoryLessonService(TheoryLessonRepository theoryLessonRepository,
                               CandidateRepository candidateRepository,
                               TrainingPhaseRepository trainingPhaseRepository) {
        this.theoryLessonRepository = theoryLessonRepository;
        this.candidateRepository = candidateRepository;
        this.trainingPhaseRepository = trainingPhaseRepository;
    }

    @Transactional
    public List<TheoryLesson> getLessonsForCandidate(Long candidateId) {
        List<TheoryLesson> existing =
                theoryLessonRepository.findByCandidateCandidateIdOrderByLessonNumber(candidateId);

        if (existing.size() < TOTAL_LESSONS) {
            initializeLessons(candidateId, existing);
            existing = theoryLessonRepository.findByCandidateCandidateIdOrderByLessonNumber(candidateId);
        }
        return existing;
    }

    private void initializeLessons(Long candidateId, List<TheoryLesson> existing) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen: " + candidateId));

        java.util.Set<Integer> existingNumbers = new java.util.HashSet<>();
        existing.forEach(l -> existingNumbers.add(l.getLessonNumber()));

        for (int i = 1; i <= TOTAL_LESSONS; i++) {
            if (!existingNumbers.contains(i)) {
                TheoryLesson lesson = new TheoryLesson();
                lesson.setCandidate(candidate);
                lesson.setLessonNumber(i);
                lesson.setCompleted(false);
                theoryLessonRepository.save(lesson);
            }
        }
    }

    @Transactional
    public TheoryLesson toggleLesson(Long candidateId, Integer lessonNumber, boolean completed) {
        if (lessonNumber < 1 || lessonNumber > TOTAL_LESSONS) {
            throw new RuntimeException("Broj lekcije mora biti između 1 i " + TOTAL_LESSONS);
        }

        getLessonsForCandidate(candidateId);

        TheoryLesson lesson = theoryLessonRepository
                .findByCandidateCandidateIdAndLessonNumber(candidateId, lessonNumber)
                .orElseThrow(() -> new RuntimeException("Lekcija nije pronađena"));

        lesson.setCompleted(completed);
        lesson.setCompletedDate(completed ? LocalDate.now() : null);
        TheoryLesson saved = theoryLessonRepository.save(lesson);

        updateTheoryPhase(candidateId);

        return saved;
    }

    private void updateTheoryPhase(Long candidateId) {
        long completedCount = theoryLessonRepository
                .countByCandidateCandidateIdAndCompletedTrue(candidateId);

        List<TrainingPhase> phases = trainingPhaseRepository
                .findByCandidateCandidateId(candidateId);

        TrainingPhase theoryPhase = phases.stream()
                .filter(p -> "TEORIJSKI DIO".equalsIgnoreCase(p.getPhaseType()))
                .findFirst()
                .orElse(null);

        if (completedCount == TOTAL_LESSONS) {
            if (theoryPhase != null) {
                theoryPhase.setStatus("POLOŽENO");
                theoryPhase.setDateCompleted(LocalDate.now());
                trainingPhaseRepository.save(theoryPhase);
            } else {
                Candidate candidate = candidateRepository.findById(candidateId)
                        .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));
                TrainingPhase newPhase = new TrainingPhase();
                newPhase.setCandidate(candidate);
                newPhase.setPhaseType("TEORIJSKI DIO");
                newPhase.setStatus("POLOŽENO");
                newPhase.setDateCompleted(LocalDate.now());
                trainingPhaseRepository.save(newPhase);
            }
        } else {
            if (theoryPhase != null && "POLOŽENO".equalsIgnoreCase(theoryPhase.getStatus())) {
                theoryPhase.setStatus("U TOKU");
                theoryPhase.setDateCompleted(null);
                trainingPhaseRepository.save(theoryPhase);
            } else if (theoryPhase == null && completedCount > 0) {
                Candidate candidate = candidateRepository.findById(candidateId)
                        .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));
                TrainingPhase newPhase = new TrainingPhase();
                newPhase.setCandidate(candidate);
                newPhase.setPhaseType("TEORIJSKI DIO");
                newPhase.setStatus("U TOKU");
                trainingPhaseRepository.save(newPhase);
            }
        }
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));
        BigDecimal pct = BigDecimal.valueOf((completedCount * 100.0) / TOTAL_LESSONS);
        candidate.setProgressPercentage(pct);
        candidateRepository.save(candidate);
    }

    public long getCompletedCount(Long candidateId) {
        return theoryLessonRepository.countByCandidateCandidateIdAndCompletedTrue(candidateId);
    }
}
