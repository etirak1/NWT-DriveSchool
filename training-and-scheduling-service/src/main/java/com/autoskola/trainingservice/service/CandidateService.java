package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.CandidateResponseDTO;
import com.autoskola.trainingservice.dto.InstructorWithUserDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.TrainingRule;
import com.autoskola.trainingservice.model.User;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import com.autoskola.trainingservice.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final InstructorService instructorService;
    private final InstructorRepository instructorRepository;
    private final TrainingRuleRepository ruleRepository;

    public CandidateService(CandidateRepository candidateRepository,
                            UserRepository userRepository,
                            InstructorService instructorService, InstructorRepository instructorRepository, TrainingRuleRepository ruleRepository) {
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
        this.instructorService = instructorService;
        this.instructorRepository = instructorRepository;
        this.ruleRepository = ruleRepository;
    }

    public CandidateResponseDTO getCandidateFullDetails(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));

        User user = userRepository.findById(candidate.getUserId())
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));

        UserDTO candidateUser = new UserDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );

        // 2. Dobavi User podatke za njegovog instruktora (koristeći već napravljeni InstructorService)
        InstructorWithUserDTO instructorDetails = null;
        if (candidate.getAssignedInstructor() != null) {
            instructorDetails = instructorService.getInstructorWithUser(candidate.getAssignedInstructor().getInstructorId());
        }

        return new CandidateResponseDTO(candidate, candidateUser, instructorDetails);
    }

    public Candidate createCandidate(Candidate candidate) {

        Instructor instructor = instructorRepository.findById(
                candidate.getAssignedInstructor().getInstructorId()
        ).orElseThrow(() -> new RuntimeException("Instructor not found"));

        TrainingRule rule = ruleRepository.findById(
                candidate.getRule().getRuleId()
        ).orElseThrow(() -> new RuntimeException("Rule not found"));

        candidate.setAssignedInstructor(instructor);
        candidate.setRule(rule);

        return candidateRepository.save(candidate);
    }
}