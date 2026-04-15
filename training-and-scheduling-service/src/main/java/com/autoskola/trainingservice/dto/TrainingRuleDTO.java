package com.autoskola.trainingservice.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainingRuleDTO {
    private Long ruleId;

    @NotNull(message = "Broj teorijskih časova je obavezan")
    @Min(value = 5, message = "Minimalno 5 teorijskih časova")
    private Integer minTheoryLessons;

    @NotNull(message = "Broj praktičnih časova je obavezan")
    @Min(value = 10, message = "Minimalno 10 praktičnih časova")
    private Integer minPracticalLessons;


    @NotNull(message = "Trajanje časa je obavezno")
    @Min(value = 30, message = "Čas ne može trajati kraće od 30 minuta")
    private Integer lessonDuration;

    @NotNull(message = "Cijena obuke je obavezna")
    @DecimalMin(value = "0.0", inclusive = false, message = "Cijena mora biti veća od 0")
    private BigDecimal coursePrice;


}