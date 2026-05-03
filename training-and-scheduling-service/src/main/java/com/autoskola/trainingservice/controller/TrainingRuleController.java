package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.TrainingRuleDTO;
import com.autoskola.trainingservice.service.TrainingRuleService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/rules")
public class TrainingRuleController {

    private final TrainingRuleService ruleService;

    public TrainingRuleController(TrainingRuleService ruleService) {
        this.ruleService = ruleService;
    }

    @GetMapping
    public List<TrainingRuleDTO> getAllRules() {
        return ruleService.getAllRules();
    }

    @GetMapping("/{id}")
    public TrainingRuleDTO getRule(@PathVariable Long id) {
        return ruleService.getRuleById(id);
    }

    @PostMapping
    public TrainingRuleDTO createRule(@Valid @RequestBody TrainingRuleDTO ruleDto) {
        return ruleService.createRule(ruleDto);
    }
}