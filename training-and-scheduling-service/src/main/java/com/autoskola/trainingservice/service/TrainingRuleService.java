package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.TrainingRuleDTO;
import com.autoskola.trainingservice.model.TrainingRule;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrainingRuleService {

    private final TrainingRuleRepository ruleRepository;
    private final ModelMapper modelMapper;

    public TrainingRuleService(TrainingRuleRepository ruleRepository, ModelMapper modelMapper) {
        this.ruleRepository = ruleRepository;
        this.modelMapper = modelMapper;
    }

    public List<TrainingRuleDTO> getAllRules() {
        return ruleRepository.findAll().stream()
                .map(rule -> modelMapper.map(rule, TrainingRuleDTO.class))
                .collect(Collectors.toList());
    }

    public TrainingRuleDTO getRuleById(Long id) {
        TrainingRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pravilo obuke nije pronađeno"));
        return modelMapper.map(rule, TrainingRuleDTO.class);
    }

    public TrainingRuleDTO createRule(TrainingRuleDTO ruleDto) {
        TrainingRule rule = modelMapper.map(ruleDto, TrainingRule.class);
        TrainingRule savedRule = ruleRepository.save(rule);

        return modelMapper.map(savedRule, TrainingRuleDTO.class);
    }
}