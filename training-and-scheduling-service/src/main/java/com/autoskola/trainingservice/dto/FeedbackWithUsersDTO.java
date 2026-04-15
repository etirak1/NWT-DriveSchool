package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.Feedback;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackWithUsersDTO {

    @Valid
    private Feedback feedback;

    @Valid
    private UserDTO instructor;

    @Valid
    private UserDTO candidate;
}