package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.model.Repairs;
import com.autoskola.resourceservice.repository.RepairsRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public Repairs getRepairById(@PathVariable Long id) {
        return repairsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Popravka nije pronađena"));
    }

    @PostMapping
    public Repairs createRepair(@Valid @RequestBody Repairs repair) {
        return repairsRepository.save(repair);
    }

    @PutMapping("/{id}")
    public Repairs updateRepair(@PathVariable Long id, @Valid @RequestBody Repairs updatedRepair) {
        Repairs repair = repairsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Popravka nije pronađena"));

        repair.setVehicle(updatedRepair.getVehicle());
        repair.setRepairDate(updatedRepair.getRepairDate());
        repair.setDescription(updatedRepair.getDescription());
        repair.setCost(updatedRepair.getCost());

        return repairsRepository.save(repair);
    }

    @DeleteMapping("/{id}")
    public void deleteRepair(@PathVariable Long id) {
        repairsRepository.deleteById(id);
    }
}