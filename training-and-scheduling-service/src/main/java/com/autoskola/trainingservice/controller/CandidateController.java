package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.CandidateResponseDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.service.CandidateService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;
    private final CandidateRepository candidateRepository;

    public CandidateController(CandidateService candidateService, CandidateRepository candidateRepository) {
        this.candidateService = candidateService;
        this.candidateRepository = candidateRepository;
    }



    // Detaljan prikaz kandidata sa imenom njega i njegovog instruktora
    @GetMapping("/{id}")
    public CandidateResponseDTO getCandidateDetails(@PathVariable Long id) {
        return candidateService.getCandidateFullDetails(id);
    }

    // Osnovno čuvanje kandidata (Input)
    @PostMapping
    public Candidate createCandidate(@Valid @RequestBody Candidate candidate) {
        return candidateService.createCandidate(candidate);
    }

    @GetMapping
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }
}