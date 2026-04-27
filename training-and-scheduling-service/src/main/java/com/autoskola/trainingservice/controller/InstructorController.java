package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.CandidateDTO;
import com.autoskola.trainingservice.dto.InstructorDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.service.InstructorService;
import jakarta.validation.Valid;
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
    public InstructorDTO getInstructor(@PathVariable Long id) {
        return instructorService.getInstructorFullDetails(id);
    }


    @PostMapping
    public InstructorDTO createInstructor(@Valid @RequestBody Instructor instructor) {
        return instructorService.createInstructor(instructor);
    }

    @GetMapping
    public List<InstructorDTO> getAllInstructors() {
        return instructorService.getAllInstructors();
    }
}