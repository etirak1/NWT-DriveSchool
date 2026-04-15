package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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

    @NotNull(message = "Kandidat je obavezan")
    @ManyToOne
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;

    @NotBlank(message = "Tip faze je obavezan")
    @Pattern(
            regexp = "^(TEORIJSKI DIO|PRAKTIČNA VOŽNJA|POLIGON|GRADSKA VOŽNJA|ISPIT)$",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "Tip faze mora biti jedan od: TEORIJSKI DIO, PRAKTIČNA VOŽNJA, POLIGON, GRADSKA VOŽNJA ili ISPIT"
    )
    private String phaseType;

    @NotBlank(message = "Status faze je obavezan")
    @Pattern(
            regexp = "^(U TOKU|POLOŽENO|NEPOLOŽENO|ZAKAZANO)$",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "Status faze može biti: U TOKU, POLOŽENO, NEPOLOŽENO ili ZAKAZANO"
    )
    private String status;

    @PastOrPresent(message = "Datum polaganja ne može biti u budućnosti")
    private LocalDate dateCompleted;
}
