package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.Candidate;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CandidateWithUserDTO {
    private Candidate candidate;
    private UserDTO user;
}