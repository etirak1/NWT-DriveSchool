package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.*;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.TrainingRule;
import com.autoskola.trainingservice.model.User;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import com.autoskola.trainingservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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

    public CandidateDTO getCandidateFullDetails(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));

        User user = userRepository.findById(candidate.getUserId())
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));

        UserDTO userDTO = new UserDTO(user.getUserId(), user.getFirstName(), user.getLastName(), user.getRole());

        InstructorDTO instructorDetails = null;
        if (candidate.getAssignedInstructor() != null) {
            instructorDetails = instructorService.getInstructorFullDetails(candidate.getAssignedInstructor().getInstructorId());
        }

        TrainingRuleDTO ruleDTO = null;
        if (candidate.getRule() != null) {
            ruleDTO = new TrainingRuleDTO(
                    candidate.getRule().getRuleId(),
                    candidate.getRule().getMinTheoryLessons(),
                    candidate.getRule().getMinPracticalLessons(),
                    candidate.getRule().getLessonDuration(),
                    candidate.getRule().getCoursePrice()
            );
        }

        return new CandidateDTO(
                candidate.getCandidateId(),
                candidate.getEnrollmentDate(),
                candidate.getProgressPercentage(),
                userDTO,
                instructorDetails,
                ruleDTO
        );
    }

    public CandidateDTO createCandidate(Candidate candidate) {
        Instructor instructor = instructorRepository.findById(candidate.getAssignedInstructor().getInstructorId())
                .orElseThrow(() -> new RuntimeException("Instruktor nije pronađen"));
        TrainingRule rule = ruleRepository.findById(candidate.getRule().getRuleId())
                .orElseThrow(() -> new RuntimeException("Pravilo nije pronađeno"));

        candidate.setAssignedInstructor(instructor);
        candidate.setRule(rule);

        Candidate savedCandidate = candidateRepository.save(candidate);

        User user = userRepository.findById(savedCandidate.getUserId())
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));
        UserDTO userDTO = new UserDTO(user.getUserId(), user.getFirstName(), user.getLastName(), user.getRole());

        InstructorDTO instructorDetails = instructorService.getInstructorFullDetails(instructor.getInstructorId());

        TrainingRuleDTO ruleDTO = new TrainingRuleDTO(rule.getRuleId(), rule.getMinTheoryLessons(),
                rule.getMinPracticalLessons(), rule.getLessonDuration(),
                rule.getCoursePrice());

        return new CandidateDTO(savedCandidate.getCandidateId(), savedCandidate.getEnrollmentDate(),
                savedCandidate.getProgressPercentage(), userDTO, instructorDetails, ruleDTO);
    }

    public List<CandidateDTO> getAllCandidates() {
        List<Candidate> candidates = candidateRepository.findAll();
        List<CandidateDTO> response = new ArrayList<>();

        for (Candidate c : candidates) {
            User u = userRepository.findById(c.getUserId()).orElse(null);
            UserDTO uDTO = (u != null) ? new UserDTO(u.getUserId(), u.getFirstName(), u.getLastName(), u.getRole()) : null;

            InstructorDTO iDTO = (c.getAssignedInstructor() != null) ?
                    instructorService.getInstructorFullDetails(c.getAssignedInstructor().getInstructorId()) : null;

            TrainingRuleDTO rDTO = (c.getRule() != null) ?
                    new TrainingRuleDTO(c.getRule().getRuleId(), c.getRule().getMinTheoryLessons(),
                            c.getRule().getMinPracticalLessons(), c.getRule().getLessonDuration(),
                            c.getRule().getCoursePrice()) : null;

            response.add(new CandidateDTO(c.getCandidateId(), c.getEnrollmentDate(),
                    c.getProgressPercentage(), uDTO, iDTO, rDTO));
        }
        return response;
    }

}