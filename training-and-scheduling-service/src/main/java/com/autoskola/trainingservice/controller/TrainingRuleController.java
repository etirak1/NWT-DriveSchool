package com.autoskola.trainingservice.controller;

import com.autoskola.trainingservice.dto.TrainingRuleDTO;
import com.autoskola.trainingservice.service.TrainingRuleService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@EnableMethodSecurity
@RequestMapping("/api/rules")
public class TrainingRuleController {

    private final TrainingRuleService ruleService;

    public TrainingRuleController(TrainingRuleService ruleService) {
        this.ruleService = ruleService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public List<TrainingRuleDTO> getAllRules() {
        return ruleService.getAllRules();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    public TrainingRuleDTO getRule(@PathVariable Long id) {
        return ruleService.getRuleById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public TrainingRuleDTO createRule(@Valid @RequestBody TrainingRuleDTO ruleDto) {
        return ruleService.createRule(ruleDto);
    }
}