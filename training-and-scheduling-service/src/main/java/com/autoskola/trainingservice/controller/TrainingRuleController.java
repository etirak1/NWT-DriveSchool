package com.autoskola.trainingservice.controller;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.autoskola.trainingservice.dto.TrainingRuleDTO;
import com.autoskola.trainingservice.model.TrainingRule;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rules")
public class TrainingRuleController {

    private final TrainingRuleRepository ruleRepository;

    public TrainingRuleController(TrainingRuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
    }


    @GetMapping
    public List<TrainingRule> getAllRules() {
        return ruleRepository.findAll();
    }


    @Autowired
    private ModelMapper modelMapper;

    @PostMapping
    public ResponseEntity<TrainingRuleDTO> createRule(@Valid @RequestBody TrainingRuleDTO ruleDto) {
        // 1. Pretvori DTO u Entity pomoću ModelMapper-a
        TrainingRule rule = modelMapper.map(ruleDto, TrainingRule.class);

        // 2. Spasi u bazu
        TrainingRule savedRule = ruleRepository.save(rule);

        // 3. Vrati nazad kao DTO
        return ResponseEntity.ok(modelMapper.map(savedRule, TrainingRuleDTO.class));
    }

    @GetMapping("/{id}")
    public TrainingRule getRule(@PathVariable Long id) {
        return ruleRepository.findById(id).orElseThrow();
    }
}