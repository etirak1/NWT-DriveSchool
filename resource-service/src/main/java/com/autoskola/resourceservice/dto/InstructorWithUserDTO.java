package com.autoskola.resourceservice.dto;

import com.autoskola.resourceservice.model.Instructor;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InstructorWithUserDTO {
    private Instructor instructor;
    private UserDTO user;
}