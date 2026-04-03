package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.InstructorWithUserDTO;
import com.autoskola.trainingservice.service.InstructorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instructors")
public class InstructorController {

    private final InstructorService instructorService;

    public InstructorController(InstructorService instructorService) {
        this.instructorService = instructorService;
    }

    @GetMapping("/{id}")
    public InstructorWithUserDTO getInstructor(@PathVariable Long id) {
        return instructorService.getInstructorWithUser(id);
    }

    @GetMapping
    public List<InstructorWithUserDTO> getAll() {
        return instructorService.getAllInstructors();
    }
}