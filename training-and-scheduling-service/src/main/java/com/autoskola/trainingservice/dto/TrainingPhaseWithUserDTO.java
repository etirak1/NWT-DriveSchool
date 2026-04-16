package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.TrainingPhase;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainingPhaseWithUserDTO {

    @Valid
    private TrainingPhase trainingPhase; // Podaci o fazi (npr. "Teorija", "Položeno")

    @Valid
    private UserDTO user;               // Podaci o kandidatu iz User servisa
}