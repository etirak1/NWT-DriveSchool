package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "training_phases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor

public class TrainingPhase{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long phaseId;

    @ManyToOne
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;

    private String phaseType;
    private String status;
    private LocalDate dateCompleted;
}
