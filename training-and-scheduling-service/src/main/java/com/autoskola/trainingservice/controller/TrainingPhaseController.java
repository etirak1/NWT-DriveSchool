package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.PhaseStatusDTO;
import com.autoskola.trainingservice.dto.TrainingPhaseDTO;
import com.autoskola.trainingservice.model.TrainingPhase;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import com.autoskola.trainingservice.service.TrainingPhaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@EnableMethodSecurity
@RequestMapping("/api/phases")
public class TrainingPhaseController {

    private final TrainingPhaseService phaseService;
    private final TrainingPhaseRepository phaseRepository;

    public TrainingPhaseController(TrainingPhaseService phaseService,
                                   TrainingPhaseRepository phaseRepository) {
        this.phaseService = phaseService;
        this.phaseRepository = phaseRepository;
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

    @GetMapping("/candidate/{candidateId}/timeline")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public ResponseEntity<List<PhaseStatusDTO>> getTimeline(@PathVariable Long candidateId) {
        return ResponseEntity.ok(phaseService.getTimeline(candidateId));
    }

    @PatchMapping("/candidate/{candidateId}/exam")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PhaseStatusDTO> upsertExamPhase(
            @PathVariable Long candidateId,
            @RequestBody Map<String, String> body) {
        String phaseType = body.get("phaseType");
        String status    = body.get("status");
        String dateStr   = body.get("examDate");
        String notes     = body.get("notes");

        LocalDate examDate = (dateStr != null && !dateStr.isBlank())
                ? LocalDate.parse(dateStr) : null;

        PhaseStatusDTO result = phaseService.upsertExamPhase(candidateId, phaseType, status, examDate, notes);
        return ResponseEntity.ok(result);
    }
}
