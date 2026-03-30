package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.model.TrainingRule;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping
    public TrainingRule createRule(@RequestBody TrainingRule rule) {
        return ruleRepository.save(rule);
    }

    @GetMapping("/{id}")
    public TrainingRule getRule(@PathVariable Long id) {
        return ruleRepository.findById(id).orElseThrow();
    }
}