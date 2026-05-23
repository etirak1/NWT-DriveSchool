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
    @Column(unique = true)
    private Long userId;

    @NotNull(message = "Datum upisa je obavezan")
    @PastOrPresent(message = "Datum upisa ne može biti u budućnosti")
    private LocalDate enrollmentDate;

    @DecimalMin(value = "0.0", message = "Progres ne može biti manji od 0%")
    @DecimalMax(value = "100.0", message = "Progres ne može biti veći od 100%")
    private BigDecimal progressPercentage;


    @ManyToOne
    @JoinColumn(name = "assigned_instructor_id")
    private Instructor assignedInstructor;


    @ManyToOne
    @JoinColumn(name = "rule_id")
    private TrainingRule rule;

}

