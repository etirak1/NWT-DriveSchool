package com.autoskola.resourceservice.controller;


import com.autoskola.resourceservice.dto.InstructorDTO;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.service.InstructorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@EnableMethodSecurity
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

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasRole('ADMIN')")
    public InstructorDTO toggleAvailability(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String note = body.get("availabilityNote");
        return instructorService.updateAvailability(id, note);
    }

}