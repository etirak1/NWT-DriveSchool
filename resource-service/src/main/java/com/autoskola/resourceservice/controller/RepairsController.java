package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.model.Repairs;
import com.autoskola.resourceservice.repository.RepairsRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/repairs")
public class RepairsController {

    private final RepairsRepository repairsRepository;

    public RepairsController(RepairsRepository repairsRepository) {
        this.repairsRepository = repairsRepository;
    }

    @GetMapping
    public List<Repairs> getAllRepairs() {
        return repairsRepository.findAllWithVehicle();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Repairs> getRepairById(@PathVariable Long id) {
        Repairs repair = repairsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Popravka nije pronađena"));

        return ResponseEntity.ok(repair);
    }

    @PostMapping
    public Repairs createRepair(@Valid @RequestBody Repairs repair) {
        return repairsRepository.save(repair);
    }


    @GetMapping("/page")
    public Page<Repairs> getRepairsPage(Pageable pageable) {
        return repairsRepository.findAll(pageable);
    }

    @GetMapping("/expensive")
    public List<Repairs> getExpensiveRepairs(@RequestParam Double cost) {
        return repairsRepository.findExpensiveRepairs(cost);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<Repairs>> createBatch(@RequestBody List<Repairs> repairsList) {
        return ResponseEntity.ok(repairsRepository.saveAll(repairsList));
    }

    @PutMapping("/{id}")
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
    public ResponseEntity<Repairs> patchRepair(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {

        Repairs repair = repairsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Popravka nije pronađena"));

        updates.forEach((key, value) -> {
            switch (key) {
                case "description":
                    repair.setDescription((String) value);
                    break;
                case "cost":
                    repair.setCost(Double.valueOf(value.toString()));
                    break;
                case "repairDate":
                    repair.setRepairDate(LocalDateTime.parse(value.toString()));
                    break;
                default:
                    throw new RuntimeException("Nepoznato polje: " + key);
            }
        });

        return ResponseEntity.ok(repairsRepository.save(repair));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRepair(@PathVariable Long id) {

        if (!repairsRepository.existsById(id)) {
            throw new RuntimeException("Popravka nije pronađena");
        }

        repairsRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }


}