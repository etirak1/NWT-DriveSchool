package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.TrainingPhase;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainingPhaseDTO {

    private Long phaseId;

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

    private CandidateDTO candidate;

}