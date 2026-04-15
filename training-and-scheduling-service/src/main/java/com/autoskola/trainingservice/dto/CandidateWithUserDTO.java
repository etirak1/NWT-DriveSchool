package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.Candidate;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import jakarta.validation.constraints.*;

@Data
@AllArgsConstructor
public class CandidateWithUserDTO {

    @Valid
    private Candidate candidate;

    @Valid
    private UserDTO user;
}