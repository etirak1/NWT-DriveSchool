package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.CandidateDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.service.CandidateService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping("/{id}")
    public CandidateDTO getCandidateDetails(@PathVariable Long id) {
        return candidateService.getCandidateFullDetails(id);
    }

    @PostMapping
    public CandidateDTO createCandidate(@Valid @RequestBody Candidate candidate) {
        return candidateService.createCandidate(candidate);
    }

    @GetMapping
    public List<CandidateDTO> getAllCandidates() {
        return candidateService.getAllCandidates();
    }
}