package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "training_rules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TrainingRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ruleId;


    @Min(value = 1, message = "Minimalan broj teorijskih časova je 1")
    private Integer minTheoryLessons;

    @Min(value = 1, message = "Minimalan broj praktičnih časova je 1")
    private Integer minPracticalLessons;

    @Min(value = 30, message = "Minimalno trajanje časa je 30 minuta")
    private Integer lessonDuration;

    @DecimalMin(value = "0.0", inclusive = false, message = "Cijena obuke mora biti veća od 0")
    private BigDecimal coursePrice;

}