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
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public CandidateDTO getCandidateDetails(@PathVariable Long id) {
        return candidateService.getCandidateFullDetails(id);
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
}