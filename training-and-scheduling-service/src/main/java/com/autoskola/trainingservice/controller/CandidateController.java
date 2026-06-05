package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.CandidateDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.service.CandidateService;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@EnableMethodSecurity
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public CandidateDTO getCandidateDetails(@PathVariable Long id) {
        return candidateService.getCandidateFullDetails(id);
    }

    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public CandidateDTO getCandidateByUserId(@PathVariable Long userId) {
        return candidateService.getCandidateByUserId(userId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public CandidateDTO createCandidate(@Valid @RequestBody Candidate candidate) {
        return candidateService.createCandidate(candidate);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public List<CandidateDTO> getAllCandidates() {
        return candidateService.getAllCandidates();
    }

    @PatchMapping("/{id}/assign-instructor/{instructorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public CandidateDTO assignInstructor(@PathVariable Long id, @PathVariable Long instructorId) {
        return candidateService.assignInstructor(id, instructorId);
    }

}