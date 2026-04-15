package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.Lesson;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class LessonWithUsersDTO {

    @Valid
    private Lesson lesson;

    @Valid
    private UserDTO instructor;

    @Valid
    private UserDTO candidate;

    @Valid
    private VehicleDTO vehicle;
}