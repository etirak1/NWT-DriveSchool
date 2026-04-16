package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.Instructor;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InstructorWithUserDTO {

    @Valid
    private Instructor instructor;

    @Valid
    private UserDTO user;
}