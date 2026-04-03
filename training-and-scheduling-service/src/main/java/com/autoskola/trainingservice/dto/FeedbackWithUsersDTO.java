package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.Feedback;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackWithUsersDTO {
    private Feedback feedback;
    private UserDTO instructor;
    private UserDTO candidate;
}