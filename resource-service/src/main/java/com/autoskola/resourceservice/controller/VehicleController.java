package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.dto.VehicleRequestDTO;
import com.autoskola.resourceservice.model.Vehicle;
import com.autoskola.resourceservice.event.ResourceEventPublisher;
import com.autoskola.resourceservice.repository.RepairsRepository;
import com.autoskola.resourceservice.repository.VehicleRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleRepository vehicleRepository;
    private final RepairsRepository repairsRepository;
    private final ResourceEventPublisher eventPublisher;

    public VehicleController(VehicleRepository vehicleRepository,
                             RepairsRepository repairsRepository,
                             ResourceEventPublisher eventPublisher) {
        this.vehicleRepository = vehicleRepository;
        this.repairsRepository = repairsRepository;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public Vehicle getVehicleById(@PathVariable Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vozilo nije pronađeno"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Vehicle createVehicle(@Valid @RequestBody Vehicle vehicle) {
        if (vehicle.getRegistrationDate() != null) {
            vehicle.setRegistrationExpiry(vehicle.getRegistrationDate().plusYears(1));
        }
        Vehicle saved = vehicleRepository.save(vehicle);
        eventPublisher.publishVehicleCreated(saved);
        return saved;
    }

    @PutMapping("/{id}")
    public Vehicle updateVehicle(@PathVariable Long id, @Valid @RequestBody VehicleRequestDTO dto) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vozilo nije pronađeno"));

        vehicle.setBrand(dto.getBrand());
        vehicle.setModel(dto.getModel());
        vehicle.setRegistrationNumber(dto.getRegistrationNumber());
        vehicle.setStatus(dto.getStatus());
        vehicle.setRegistrationDate(dto.getRegistrationDate());

        if (dto.getRegistrationDate() != null) {
            vehicle.setRegistrationExpiry(dto.getRegistrationDate().plusYears(1));
        }

        vehicle.setLastTechnicalInspection(dto.getLastTechnicalInspection());

        Vehicle saved = vehicleRepository.save(vehicle);
        eventPublisher.publishVehicleUpdated(saved);
        return saved;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException("Vozilo nije pronađeno");
        }
        repairsRepository.deleteByVehicle_VehicleId(id);
        vehicleRepository.deleteById(id);
        eventPublisher.publishVehicleDeleted(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public List<Vehicle> getAvailableVehicles() {
        return vehicleRepository.findByStatus("ACTIVE");
    }
}