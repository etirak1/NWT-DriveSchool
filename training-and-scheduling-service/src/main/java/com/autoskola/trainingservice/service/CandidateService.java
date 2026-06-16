package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.*;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.TrainingRule;
import com.autoskola.trainingservice.client.UserClient;
import com.autoskola.trainingservice.repository.CandidateRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
import com.autoskola.trainingservice.repository.TrainingPhaseRepository;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final UserClient userClient;
    private final InstructorService instructorService;
    private final InstructorRepository instructorRepository;
    private final TrainingRuleRepository ruleRepository;
    private final TrainingPhaseRepository trainingPhaseRepository;

    public CandidateService(CandidateRepository candidateRepository,
                            UserClient userClient,
                            InstructorService instructorService,
                            InstructorRepository instructorRepository,
                            TrainingRuleRepository ruleRepository,
                            TrainingPhaseRepository trainingPhaseRepository) {
        this.candidateRepository = candidateRepository;
        this.userClient = userClient;
        this.instructorService = instructorService;
        this.instructorRepository = instructorRepository;
        this.ruleRepository = ruleRepository;
        this.trainingPhaseRepository = trainingPhaseRepository;
    }

    public CandidateDTO getCandidateByUserId(Long userId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));
        return buildDTO(candidate);
    }

    public CandidateDTO getCandidateFullDetails(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));
        return buildDTO(candidate);
    }

    private CandidateDTO buildDTO(Candidate candidate) {
        UserDTO userDTO;
        try {
            userDTO = userClient.getUserById(candidate.getUserId());
        } catch (Exception e) {
            userDTO = new UserDTO(candidate.getUserId(), "Nepoznato", "Korisnik", "CANDIDATE");
        }

        InstructorDTO instructorDetails = null;
        if (candidate.getAssignedInstructor() != null) {
            instructorDetails = instructorService.getInstructorFullDetails(
                    candidate.getAssignedInstructor().getInstructorId());
        }

        TrainingRuleDTO ruleDTO = toRuleDTO(candidate.getRule());

        boolean theoryPassed =
                trainingPhaseRepository.findByCandidateCandidateIdAndPhaseTypeIgnoreCase(
                                candidate.getCandidateId(), "TEORIJSKI ISPIT")
                        .stream().anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()))
                || trainingPhaseRepository.findByCandidateCandidateIdAndPhaseTypeIgnoreCase(
                                candidate.getCandidateId(), "TEORIJSKI DIO")
                        .stream().anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()));

        CandidateDTO dto = new CandidateDTO();
        dto.setCandidateId(candidate.getCandidateId());
        dto.setEnrollmentDate(candidate.getEnrollmentDate());
        dto.setProgressPercentage(candidate.getProgressPercentage());
        dto.setUser(userDTO);
        dto.setAssignedInstructor(instructorDetails);
        dto.setRule(ruleDTO);
        dto.setTheoryExamPassed(theoryPassed);
        return dto;
    }

    private TrainingRuleDTO toRuleDTO(TrainingRule rule) {
        if (rule == null) return null;
        return new TrainingRuleDTO(
                rule.getRuleId(),
                rule.getMinTheoryLessons(),
                rule.getMinPracticalLessons(),
                rule.getLessonDuration(),
                rule.getCoursePrice(),
                rule.getMaxLessonsPerWeek()
        );
    }

    public CandidateDTO createCandidate(Candidate candidate) {
        Instructor instructor = instructorRepository.findById(
                candidate.getAssignedInstructor().getInstructorId())
                .orElseThrow(() -> new RuntimeException("Instruktor nije pronađen"));
        TrainingRule rule = ruleRepository.findById(candidate.getRule().getRuleId())
                .orElseThrow(() -> new RuntimeException("Pravilo nije pronađeno"));

        candidate.setAssignedInstructor(instructor);
        candidate.setRule(rule);

        Candidate savedCandidate = candidateRepository.save(candidate);

        try {
            userClient.getUserById(savedCandidate.getUserId());
        } catch (Exception e) {
            throw new RuntimeException(
                    "Korisnik sa ID-om " + savedCandidate.getUserId() + " ne postoji u user-service.");
        }

        return buildDTO(savedCandidate);
    }

    public List<CandidateDTO> getAllCandidates() {
        return candidateRepository.findAll().stream()
                .map(this::buildDTOOrNull)
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    private CandidateDTO buildDTOOrNull(Candidate candidate) {
        UserDTO userDTO;
        try {
            userDTO = userClient.getUserById(candidate.getUserId());
        } catch (Exception e) {
            return null;
        }

        InstructorDTO instructorDetails = null;
        if (candidate.getAssignedInstructor() != null) {
            instructorDetails = instructorService.getInstructorFullDetails(
                    candidate.getAssignedInstructor().getInstructorId());
        }

        TrainingRuleDTO ruleDTO = toRuleDTO(candidate.getRule());

        boolean theoryPassed =
                trainingPhaseRepository.findByCandidateCandidateIdAndPhaseTypeIgnoreCase(
                                candidate.getCandidateId(), "TEORIJSKI ISPIT")
                        .stream().anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()))
                || trainingPhaseRepository.findByCandidateCandidateIdAndPhaseTypeIgnoreCase(
                                candidate.getCandidateId(), "TEORIJSKI DIO")
                        .stream().anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()));

        CandidateDTO dto = new CandidateDTO();
        dto.setCandidateId(candidate.getCandidateId());
        dto.setEnrollmentDate(candidate.getEnrollmentDate());
        dto.setProgressPercentage(candidate.getProgressPercentage());
        dto.setUser(userDTO);
        dto.setAssignedInstructor(instructorDetails);
        dto.setRule(ruleDTO);
        dto.setTheoryExamPassed(theoryPassed);
        return dto;
    }

    public CandidateDTO assignInstructor(Long candidateId, Long instructorUserId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Kandidat nije pronađen"));

        boolean theoryPassed =
                trainingPhaseRepository.findByCandidateCandidateIdAndPhaseTypeIgnoreCase(
                                candidateId, "TEORIJSKI ISPIT")
                        .stream().anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()))
                || trainingPhaseRepository.findByCandidateCandidateIdAndPhaseTypeIgnoreCase(
                                candidateId, "TEORIJSKI DIO")
                        .stream().anyMatch(p -> "POLOŽENO".equalsIgnoreCase(p.getStatus()));

        if (!theoryPassed) {
            throw new RuntimeException(
                    "Kandidat nije položio teorijski ispit. " +
                    "Instruktor se može dodijeliti tek nakon položene teorije.");
        }

        Instructor instructor = instructorRepository.findByUserId(instructorUserId)
                .orElseGet(() -> {
                    Instructor novi = new Instructor();
                    novi.setUserId(instructorUserId);
                    novi.setAvailabilityNote("AVAILABLE");
                    return instructorRepository.save(novi);
                });

        if ("UNAVAILABLE".equals(instructor.getAvailabilityNote())) {
            throw new RuntimeException(
                    "Instruktor je označen kao nedostupan i ne može biti dodijeljen kandidatu.");
        }

        candidate.setAssignedInstructor(instructor);
        candidateRepository.save(candidate);

        return getCandidateFullDetails(candidate.getCandidateId());
    }
}
