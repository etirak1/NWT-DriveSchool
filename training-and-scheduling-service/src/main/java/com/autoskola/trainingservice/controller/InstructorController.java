package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.CandidateDTO;
import com.autoskola.trainingservice.dto.InstructorDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.service.InstructorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/instructors")
public class InstructorController {

    private final InstructorService instructorService;

    public InstructorController(InstructorService instructorService) {
        this.instructorService = instructorService;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public InstructorDTO getInstructor(@PathVariable Long id) {
        return instructorService.getInstructorFullDetails(id);
    }


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public InstructorDTO createInstructor(@Valid @RequestBody Instructor instructor) {
        return instructorService.createInstructor(instructor);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public List<InstructorDTO> getAllInstructors() {
        return instructorService.getAllInstructors();
    }

    @Value("${server.port}")
    private String port;

    @GetMapping("/performance-report")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getPerformanceReport() {
        Map<String, Object> response = new HashMap<>();
        response.put("calculatedOnPort", port);
        response.put("reportData", instructorService.getInstructorPerformanceReport());
        return response;
    }
}