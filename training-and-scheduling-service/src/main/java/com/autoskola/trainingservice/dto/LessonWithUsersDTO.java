package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.Lesson;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LessonWithUsersDTO {
    private Lesson lesson;
    private UserDTO instructor;
    private UserDTO candidate;
    private VehicleDTO vehicle;
}