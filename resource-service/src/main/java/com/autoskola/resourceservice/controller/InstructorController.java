package com.autoskola.resourceservice.controller;


import com.autoskola.resourceservice.dto.InstructorWithUserDTO;
import com.autoskola.resourceservice.dto.UserDTO;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.repository.InstructorRepository;
import com.autoskola.resourceservice.service.UserClientService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class InstructorController {

    private final InstructorRepository instructorRepository;
    private final UserClientService userClientService;

    public InstructorController(InstructorRepository instructorRepository,
                                UserClientService userClientService) {
        this.instructorRepository = instructorRepository;
        this.userClientService = userClientService;
    }

    @GetMapping("/instructors/{id}")
    public InstructorWithUserDTO getInstructorWithUser(@PathVariable Long id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        UserDTO user = userClientService.getUserById(instructor.getUserId());
        return new InstructorWithUserDTO(instructor, user);
    }
}