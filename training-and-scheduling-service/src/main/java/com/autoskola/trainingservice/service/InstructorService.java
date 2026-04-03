package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.InstructorWithUserDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.repository.InstructorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InstructorService {

    private final InstructorRepository instructorRepository;
    private final UserClientService userClientService;

    public InstructorService(InstructorRepository instructorRepository, UserClientService userClientService) {
        this.instructorRepository = instructorRepository;
        this.userClientService = userClientService;
    }

    public InstructorWithUserDTO getInstructorWithUser(Long id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        UserDTO user = userClientService.getUserById(instructor.getUserId());
        return new InstructorWithUserDTO(instructor, user);
    }

    public List<InstructorWithUserDTO> getAllInstructors() {
        return instructorRepository.findAll().stream()
                .map(inst -> new InstructorWithUserDTO(inst, userClientService.getUserById(inst.getUserId())))
                .collect(Collectors.toList());
    }
}