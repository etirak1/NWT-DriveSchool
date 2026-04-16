package com.autoskola.resourceservice.mapper;

import com.autoskola.resourceservice.dto.InstructorWithUserDTO;
import com.autoskola.resourceservice.dto.UserDTO;
import com.autoskola.resourceservice.model.Instructor;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InstructorMapper {

    default InstructorWithUserDTO toDTO(Instructor instructor, UserDTO user) {
        return new InstructorWithUserDTO(instructor, user);
    }
}