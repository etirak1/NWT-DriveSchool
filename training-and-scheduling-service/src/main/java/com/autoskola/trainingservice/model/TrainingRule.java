package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "training_rules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TrainingRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ruleId;

    private Integer minTheoryLessons;
    private Integer minPracticalLessons;
    private Integer lessonDuration;
    private BigDecimal coursePrice;

}