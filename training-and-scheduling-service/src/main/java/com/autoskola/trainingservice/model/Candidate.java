package com.autoskola.trainingservice.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "candidates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long candidateId;

    @NotNull(message = "User ID je obavezan")
    private Long userId;

    @NotNull(message = "Datum upisa je obavezan")
    @PastOrPresent(message = "Datum upisa ne može biti u budućnosti")
    private LocalDate enrollmentDate;

    @DecimalMin(value = "0.0", message = "Progres ne može biti manji od 0%")
    @DecimalMax(value = "100.0", message = "Progres ne može biti veći od 100%")
    private BigDecimal progressPercentage;

    @NotNull(message = "Instruktor mora biti dodijeljen")
    @ManyToOne
    @JoinColumn(name = "assigned_instructor_id")
    private Instructor assignedInstructor;

    @NotNull(message = "Pravilo obuke mora biti odabrano")
    @ManyToOne
    @JoinColumn(name = "rule_id")
    private TrainingRule rule;

}

