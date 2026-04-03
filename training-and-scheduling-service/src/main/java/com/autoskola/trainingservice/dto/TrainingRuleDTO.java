package com.autoskola.trainingservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TrainingRuleDTO {
    private Long ruleId;
    private Integer minTheoryLessons;
    private Integer minPracticalLessons;
    private Integer lessonDuration;
    private BigDecimal coursePrice;
}