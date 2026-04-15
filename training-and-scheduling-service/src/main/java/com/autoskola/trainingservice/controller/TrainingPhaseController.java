package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.TrainingPhaseWithUserDTO;
import com.autoskola.trainingservice.model.TrainingPhase;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import com.autoskola.trainingservice.service.TrainingPhaseService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/phases")
public class TrainingPhaseController {

    private final TrainingPhaseService phaseService;
    private final TrainingPhaseRepository phaseRepository;

    public TrainingPhaseController(TrainingPhaseService phaseService, TrainingPhaseRepository phaseRepository) {
        this.phaseService = phaseService;
        this.phaseRepository = phaseRepository;
    }

    @GetMapping("/{id}")
    public TrainingPhaseWithUserDTO getPhaseDetails(@PathVariable Long id) {
        return phaseService.getPhaseWithCandidate(id);
    }

    @PostMapping
    public TrainingPhase createPhase(@Valid @RequestBody TrainingPhase phase) {
        return phaseService.createPhase(phase);
    }
}