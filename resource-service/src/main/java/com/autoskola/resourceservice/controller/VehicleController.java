package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.dto.VehicleRequestDTO;
import com.autoskola.resourceservice.model.Vehicle;
import com.autoskola.resourceservice.repository.VehicleRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleRepository vehicleRepository;

    public VehicleController(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
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
            vehicle.setRegistrationExpiry(
                    vehicle.getRegistrationDate().plusYears(1)
            );
        }

        return vehicleRepository.save(vehicle);
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
            vehicle.setRegistrationExpiry(
                    dto.getRegistrationDate().plusYears(1)
            );
        }

        vehicle.setLastTechnicalInspection(dto.getLastTechnicalInspection());

        return vehicleRepository.save(vehicle);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException("Vozilo nije pronađeno");
        }
        return ResponseEntity.noContent().build();
    }
}