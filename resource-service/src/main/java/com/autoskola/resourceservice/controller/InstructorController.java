package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.dto.InstructorDTO;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.event.ResourceEventPublisher;
import com.autoskola.resourceservice.model.Vehicle;
import com.autoskola.resourceservice.repository.VehicleRepository;
import com.autoskola.resourceservice.service.InstructorService;
import jakarta.validation.Valid;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@EnableMethodSecurity
@RequestMapping("/api/instructors")
public class InstructorController {

    private final InstructorService instructorService;
    private final ResourceEventPublisher eventPublisher;
    private final VehicleRepository vehicleRepository;

    public InstructorController(InstructorService instructorService,
                                ResourceEventPublisher eventPublisher, VehicleRepository vehicleRepository) {
        this.instructorService = instructorService;
        this.eventPublisher = eventPublisher;
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public InstructorDTO getInstructor(@PathVariable Long id) {
        return instructorService.getInstructorFullDetails(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public InstructorDTO createInstructor(@Valid @RequestBody Instructor instructor) {
        InstructorDTO saved = instructorService.createInstructor(instructor);
        eventPublisher.publishInstructorAvailabilityUpdated(
                saved.getInstructorId(), saved.getAvailabilityNote());
        return saved;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public List<InstructorDTO> getAllInstructors() {
        return instructorService.getAllInstructors();
    }

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasRole('ADMIN')")
    public InstructorDTO toggleAvailability(@PathVariable Long id,
                                            @RequestBody Map<String, String> body) {
        String note = body.get("availabilityNote");
        InstructorDTO updated = instructorService.updateAvailability(id, note);
        eventPublisher.publishInstructorAvailabilityUpdated(id, note);
        return updated;
    }

    @PatchMapping("/{id}/assign-vehicle")
    @PreAuthorize("hasRole('ADMIN')")
    public InstructorDTO assignVehicle(@PathVariable Long id,
                                       @RequestBody Map<String, Long> body) {
        Long vehicleId = body.get("vehicleId");
        if (vehicleId == null) {
            throw new RuntimeException("vehicleId je obavezan u request body.");
        }
        return instructorService.assignVehicleToInstructor(id, vehicleId);
    }
}