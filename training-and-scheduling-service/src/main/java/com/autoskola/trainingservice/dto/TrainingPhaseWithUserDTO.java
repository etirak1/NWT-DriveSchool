package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.TrainingPhase;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainingPhaseWithUserDTO {
    private TrainingPhase trainingPhase; // Podaci o fazi (npr. "Teorija", "Položeno")
    private UserDTO user;               // Podaci o kandidatu iz User servisa
}