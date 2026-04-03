package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.Instructor;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InstructorWithUserDTO {
    private Instructor instructor;
    private UserDTO user;
}