package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.TrainingPhaseDTO;
import com.autoskola.trainingservice.model.TrainingPhase;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import com.autoskola.trainingservice.service.TrainingPhaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@EnableMethodSecurity
@RequestMapping("/api/phases")
public class TrainingPhaseController {

    private final TrainingPhaseService phaseService;
    private final TrainingPhaseRepository phaseRepository;

    public TrainingPhaseController(TrainingPhaseService phaseService, TrainingPhaseRepository phaseRepository, TrainingPhaseRepository phaseRepository1) {
        this.phaseService = phaseService;
        this.phaseRepository = phaseRepository1;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public TrainingPhaseDTO getPhaseDetails(@PathVariable Long id) {
        return phaseService.getPhaseDetails(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public TrainingPhaseDTO createPhase(@Valid @RequestBody TrainingPhase phase) {
        return phaseService.createPhase(phase);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public List<TrainingPhaseDTO> getAllPhases() {
        return phaseService.getAllPhases();
    }



    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public ResponseEntity<List<TrainingPhase>> getPhasesByCandidate(@PathVariable Long candidateId) {
        return ResponseEntity.ok(phaseRepository.findByCandidateCandidateId(candidateId));
    }

}