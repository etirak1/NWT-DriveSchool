package com.autoskola.resourceservice.controller;


import com.autoskola.resourceservice.dto.InstructorWithUserDTO;
import com.autoskola.resourceservice.dto.UserDTO;
import com.autoskola.resourceservice.exception.ResourceNotFoundException;
import com.autoskola.resourceservice.mapper.InstructorMapper;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.repository.InstructorRepository;
import com.autoskola.resourceservice.service.InstructorService;
import com.autoskola.resourceservice.service.UserClientService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;


import java.util.List;


@RestController
public class InstructorController {


    private final UserClientService userClientService;
    private final InstructorMapper instructorMapper;
    private final InstructorService instructorService;

    public InstructorController(UserClientService userClientService,
                                InstructorMapper instructorMapper,
                                InstructorService instructorService) {
        this.userClientService = userClientService;
        this.instructorMapper = instructorMapper;
        this.instructorService = instructorService;
    }

    @GetMapping("/instructors/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public InstructorWithUserDTO getInstructorWithUser(@PathVariable Long id) {
        Instructor instructor = instructorService.getById(id);

        UserDTO user = userClientService.getUserById(instructor.getUserId());
        return instructorMapper.toDTO(instructor, user);
    }
    @GetMapping("/instructors")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Instructor> getAll() {
        return instructorService.getAll();
    }
}