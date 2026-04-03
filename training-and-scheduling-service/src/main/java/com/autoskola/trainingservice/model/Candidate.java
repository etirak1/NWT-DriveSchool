package com.autoskola.trainingservice.model;


import jakarta.persistence.*;
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

    private Long userId;

    private LocalDate enrollmentDate;
    private BigDecimal progressPercentage;

    @ManyToOne
    @JoinColumn(name = "assigned_instructor_id")
    private Instructor assignedInstructor;

    @ManyToOne
    @JoinColumn(name = "rule_id")
    private TrainingRule rule;

}

