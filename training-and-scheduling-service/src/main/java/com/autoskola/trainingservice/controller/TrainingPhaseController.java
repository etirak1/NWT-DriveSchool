package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.TrainingPhaseDTO;
import com.autoskola.trainingservice.model.TrainingPhase;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import com.autoskola.trainingservice.service.TrainingPhaseService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/phases")
public class TrainingPhaseController {

    private final TrainingPhaseService phaseService;

    public TrainingPhaseController(TrainingPhaseService phaseService, TrainingPhaseRepository phaseRepository) {
        this.phaseService = phaseService;
    }

    @GetMapping("/{id}")
    public TrainingPhaseDTO getPhaseDetails(@PathVariable Long id) {
        return phaseService.getPhaseDetails(id);
    }

    @PostMapping
    public TrainingPhaseDTO createPhase(@Valid @RequestBody TrainingPhase phase) {
        return phaseService.createPhase(phase);
    }

    @GetMapping
    public List<TrainingPhaseDTO> getAllPhases() {
        return phaseService.getAllPhases();
    }
}