package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.TrainingPhaseWithUserDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.TrainingPhase;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import org.springframework.stereotype.Service;

@Service
public class TrainingPhaseService {

    private final TrainingPhaseRepository phaseRepository;
    private final UserService userService;
    private final CandidateRepository candidateRepository;

    public TrainingPhaseService(TrainingPhaseRepository phaseRepository,
                                UserService userService, CandidateRepository candidateRepository) {
        this.phaseRepository = phaseRepository;
        this.userService = userService;
        this.candidateRepository = candidateRepository;
    }

    public TrainingPhaseWithUserDTO getPhaseWithCandidate(Long id) {
        TrainingPhase phase = phaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phase not found"));

        UserDTO candidateUser = userService.getUserById(
                phase.getCandidate().getUserId()
        );

        return new TrainingPhaseWithUserDTO(
                phase,
                candidateUser
        );
    }

    public TrainingPhase createPhase(TrainingPhase phase) {

        Long candidateId = phase.getCandidate().getCandidateId();

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        phase.setCandidate(candidate);

        return phaseRepository.save(phase);
    }
}
