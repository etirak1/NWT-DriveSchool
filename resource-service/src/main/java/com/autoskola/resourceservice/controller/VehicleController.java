package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.model.Vehicle;
import com.autoskola.resourceservice.repository.VehicleRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleRepository vehicleRepository;

    public VehicleController(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @GetMapping("/{id}")
    public Vehicle getVehicleById(@PathVariable Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vozilo nije pronađeno"));
    }

    @PostMapping
    public Vehicle createVehicle(@Valid @RequestBody Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    @PutMapping("/{id}")
    public Vehicle updateVehicle(@PathVariable Long id, @Valid @RequestBody Vehicle updatedVehicle) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vozilo nije pronađeno"));

        vehicle.setBrand(updatedVehicle.getBrand());
        vehicle.setModel(updatedVehicle.getModel());
        vehicle.setRegistrationNumber(updatedVehicle.getRegistrationNumber());
        vehicle.setStatus(updatedVehicle.getStatus());
        vehicle.setLastTechnicalInspection(updatedVehicle.getLastTechnicalInspection());
        vehicle.setRegistrationDate(updatedVehicle.getRegistrationDate());

        return vehicleRepository.save(vehicle);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}