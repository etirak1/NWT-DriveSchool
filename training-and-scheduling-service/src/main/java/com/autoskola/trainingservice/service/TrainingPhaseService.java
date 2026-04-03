package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.TrainingPhaseWithUserDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.TrainingPhase;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import org.springframework.stereotype.Service;

@Service
public class TrainingPhaseService {

    private final TrainingPhaseRepository phaseRepository;
    private final UserClientService userClientService;

    public TrainingPhaseService(TrainingPhaseRepository phaseRepository, UserClientService userClientService) {
        this.phaseRepository = phaseRepository;
        this.userClientService = userClientService;
    }

    public TrainingPhaseWithUserDTO getPhaseWithCandidate(Long id) {
        TrainingPhase phase = phaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phase not found"));

        UserDTO candidateUser = userClientService.getUserById(phase.getCandidate().getUserId());

        return new TrainingPhaseWithUserDTO(phase, candidateUser);
    }
}