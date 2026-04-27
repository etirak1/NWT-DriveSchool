package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.CandidateDTO;
import com.autoskola.trainingservice.dto.TrainingPhaseDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.TrainingPhase;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrainingPhaseService {

    private final TrainingPhaseRepository phaseRepository;
    private final CandidateService candidateService;
    private final CandidateRepository candidateRepository;

    public TrainingPhaseService(TrainingPhaseRepository phaseRepository,
                                CandidateService candidateService,
                                CandidateRepository candidateRepository) {
        this.phaseRepository = phaseRepository;
        this.candidateService = candidateService;
        this.candidateRepository = candidateRepository;
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

    public TrainingPhaseDTO createPhase(TrainingPhase phase) {
        Long candidateId = phase.getCandidate().getCandidateId();

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));

        phase.setCandidate(candidate);
        TrainingPhase savedPhase = phaseRepository.save(phase);

        return getPhaseDetails(savedPhase.getPhaseId());
    }

    public List<TrainingPhaseDTO> getAllPhases() {
        return phaseRepository.findAll().stream()
                .map(phase -> getPhaseDetails(phase.getPhaseId()))
                .collect(Collectors.toList());
    }
}



