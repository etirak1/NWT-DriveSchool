package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.CandidateResponseDTO;
import com.autoskola.trainingservice.dto.InstructorWithUserDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.repository.CandidateRepository;
import org.springframework.stereotype.Service;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final UserClientService userClientService;
    private final InstructorService instructorService;

    public CandidateService(CandidateRepository candidateRepository,
                            UserClientService userClientService,
                            InstructorService instructorService) {
        this.candidateRepository = candidateRepository;
        this.userClientService = userClientService;
        this.instructorService = instructorService;
    }

    public CandidateResponseDTO getCandidateFullDetails(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        // 1. Dobavi User podatke za samog kandidata
        UserDTO candidateUser = userClientService.getUserById(candidate.getUserId());

        // 2. Dobavi User podatke za njegovog instruktora (koristeći već napravljeni InstructorService)
        InstructorWithUserDTO instructorDetails = null;
        if (candidate.getAssignedInstructor() != null) {
            instructorDetails = instructorService.getInstructorWithUser(candidate.getAssignedInstructor().getInstructorId());
        }

        return new CandidateResponseDTO(candidate, candidateUser, instructorDetails);
    }
}