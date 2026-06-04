package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.*;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.TrainingRule;
import com.autoskola.trainingservice.client.UserClient;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final UserClient userClient;
    private final InstructorService instructorService;
    private final InstructorRepository instructorRepository;
    private final TrainingRuleRepository ruleRepository;

    public CandidateService(CandidateRepository candidateRepository,
                            UserClient userClient,
                            InstructorService instructorService, InstructorRepository instructorRepository, TrainingRuleRepository ruleRepository) {
        this.candidateRepository = candidateRepository;
        this.userClient = userClient;
        this.instructorService = instructorService;
        this.instructorRepository = instructorRepository;
        this.ruleRepository = ruleRepository;
    }

    public CandidateDTO getCandidateFullDetails(Long id) {

        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));

        UserDTO userDTO;
        try {
            userDTO = userClient.getUserById(candidate.getUserId());
        } catch (Exception e) {
            userDTO = new UserDTO(candidate.getUserId(), "Nepoznato", "Korisnik", "CANDIDATE");
        }

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
                    candidate.getRule().getCoursePrice(),
                    candidate.getRule().getMaxLessonsPerWeek()
            );
        }

        CandidateDTO dto = new CandidateDTO();
        dto.setCandidateId(candidate.getCandidateId());
        dto.setEnrollmentDate(candidate.getEnrollmentDate());
        dto.setProgressPercentage(candidate.getProgressPercentage());
        dto.setUser(userDTO);
        dto.setAssignedInstructor(instructorDetails);
        dto.setRule(ruleDTO);
        return dto;
    }

    public CandidateDTO createCandidate(Candidate candidate) {
        Instructor instructor = instructorRepository.findById(candidate.getAssignedInstructor().getInstructorId())
                .orElseThrow(() -> new RuntimeException("Instruktor nije pronađen"));
        TrainingRule rule = ruleRepository.findById(candidate.getRule().getRuleId())
                .orElseThrow(() -> new RuntimeException("Pravilo nije pronađeno"));

        candidate.setAssignedInstructor(instructor);
        candidate.setRule(rule);

        Candidate savedCandidate = candidateRepository.save(candidate);

        UserDTO userDTO;
        try {
            userDTO = userClient.getUserById(savedCandidate.getUserId());
        } catch (Exception e) {
            throw new RuntimeException("Korisnik sa ID-om " + savedCandidate.getUserId() + " ne postoji u user-service.");
        }
        InstructorDTO instructorDetails = instructorService.getInstructorFullDetails(instructor.getInstructorId());

        TrainingRuleDTO ruleDTO = new TrainingRuleDTO(
                rule.getRuleId(),
                rule.getMinTheoryLessons(),
                rule.getMinPracticalLessons(),
                rule.getLessonDuration(),
                rule.getCoursePrice(),
                rule.getMaxLessonsPerWeek()
        );

        return new CandidateDTO(savedCandidate.getCandidateId(), savedCandidate.getEnrollmentDate(),
                savedCandidate.getProgressPercentage(), userDTO, instructorDetails, ruleDTO);
    }

    public List<CandidateDTO> getAllCandidates() {
        List<Candidate> candidates = candidateRepository.findAll();
        List<CandidateDTO> response = new ArrayList<>();

        for (Candidate c : candidates) {
            UserDTO uDTO;
            try {
                uDTO = userClient.getUserById(c.getUserId());
            } catch (Exception e) {
                uDTO = new UserDTO(c.getUserId(), "Nepoznato", "Korisnik", "N/A");
            }

            InstructorDTO iDTO = (c.getAssignedInstructor() != null) ?
                    instructorService.getInstructorFullDetails(c.getAssignedInstructor().getInstructorId()) : null;

            TrainingRuleDTO rDTO = (c.getRule() != null) ?
                    new TrainingRuleDTO(
                            c.getRule().getRuleId(),
                            c.getRule().getMinTheoryLessons(),
                            c.getRule().getMinPracticalLessons(),
                            c.getRule().getLessonDuration(),
                            c.getRule().getCoursePrice(),
                            c.getRule().getMaxLessonsPerWeek()
                    ) : null;

            response.add(new CandidateDTO(c.getCandidateId(), c.getEnrollmentDate(),
                    c.getProgressPercentage(), uDTO, iDTO, rDTO));
        }
        return response;
    }

    public CandidateDTO assignInstructor(Long candidateId, Long instructorUserId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));

        Instructor instructor = instructorRepository.findByUserId(instructorUserId)
                .orElseThrow(() -> new RuntimeException("Instruktor nije pronađen"));

        candidate.setAssignedInstructor(instructor);
        candidateRepository.save(candidate);

        return getCandidateFullDetails(candidate.getCandidateId());
    }



}