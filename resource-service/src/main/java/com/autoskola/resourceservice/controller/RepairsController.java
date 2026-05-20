package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.dto.RepairRequestDTO;
import com.autoskola.resourceservice.model.Repairs;
import com.autoskola.resourceservice.model.Vehicle;
import com.autoskola.resourceservice.repository.RepairsRepository;
import com.autoskola.resourceservice.repository.VehicleRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/repairs")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class RepairsController {

    private final RepairsRepository repairsRepository;
    private final VehicleRepository vehicleRepository;

    public RepairsController(RepairsRepository repairsRepository, VehicleRepository vehicleRepository) {
        this.repairsRepository = repairsRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Repairs> getAllRepairs() {
        System.out.println("Metoda getAllRepairs pozvana na portu: " + port);
        return repairsRepository.findAllWithVehicle();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Repairs> getRepairById(@PathVariable Long id) {
        Repairs repair = repairsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Popravka nije pronađena"));

        return ResponseEntity.ok(repair);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Repairs createRepair(@Valid @RequestBody Repairs repair) {
        return repairsRepository.save(repair);
    }


    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Repairs> getRepairsPage(Pageable pageable) {
        return repairsRepository.findAll(pageable);
    }

    @GetMapping("/expensive")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Repairs> getExpensiveRepairs(@RequestParam Double cost) {
        return repairsRepository.findExpensiveRepairs(cost);
    }

    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Repairs>> createBatch(@RequestBody List<Repairs> repairsList) {

        for (Repairs r : repairsList) {
            Long vehicleId = r.getVehicle().getVehicleId();

            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));

            r.setVehicle(vehicle);
        }

        return ResponseEntity.ok(repairsRepository.saveAll(repairsList));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Repairs> updateRepair(
            @PathVariable Long id,
            @Valid @RequestBody Repairs updatedRepair) {

        Repairs repair = repairsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Popravka nije pronađena"));

        repair.setVehicle(updatedRepair.getVehicle());
        repair.setRepairDate(updatedRepair.getRepairDate());
        repair.setDescription(updatedRepair.getDescription());
        repair.setCost(updatedRepair.getCost());

        return ResponseEntity.ok(repairsRepository.save(repair));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Repairs> patchRepair(
            @PathVariable Long id,
            @RequestBody RepairRequestDTO dto) {

        Repairs repair = repairsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Popravka nije pronađena"));

        if (dto.getDescription() != null) {
            repair.setDescription(dto.getDescription());
        }

        if (dto.getCost() != null) {
            repair.setCost(dto.getCost());
        }

        if (dto.getRepairDate() != null) {
            repair.setRepairDate(dto.getRepairDate());
        }

        return ResponseEntity.ok(repairsRepository.save(repair));
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRepair(@PathVariable Long id) {

        if (!repairsRepository.existsById(id)) {
            throw new RuntimeException("Popravka nije pronađena");
        }

        repairsRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    @Value("${server.port}")
    private String port;

    @GetMapping("/port")
    public String getPort() {
        return "Odziv sa porta: " + port;
    }


}