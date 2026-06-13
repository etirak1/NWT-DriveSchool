package com.autoskola.trainingservice.dto;


import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDTO {

    private Long candidateId;

    @NotNull(message = "Datum upisa je obavezan")
    @PastOrPresent(message = "Datum upisa ne može biti u budućnosti")
    private LocalDate enrollmentDate;

    @DecimalMin(value = "0.0", message = "Progres ne može biti manji od 0%")
    @DecimalMax(value = "100.0", message = "Progres ne može biti veći od 100%")
    private BigDecimal progressPercentage;

    private UserDTO user;

    private InstructorDTO assignedInstructor;
    private TrainingRuleDTO rule;
    private boolean theoryExamPassed;

}
