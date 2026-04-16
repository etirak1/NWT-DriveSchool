package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.InstructorWithUserDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.User;
import com.autoskola.trainingservice.repository.InstructorRepository;
import com.autoskola.trainingservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InstructorService {

    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;

    public InstructorService(InstructorRepository instructorRepository,
                             UserRepository userRepository) {
        this.instructorRepository = instructorRepository;
        this.userRepository = userRepository;
    }

    public InstructorWithUserDTO getInstructorWithUser(Long id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        User user = userRepository.findById(instructor.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO userDTO = new UserDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );

        return new InstructorWithUserDTO(instructor, userDTO);
    }

    public List<InstructorWithUserDTO> getAllInstructors() {
        return instructorRepository.findAll().stream()
                .map(inst -> {
                    User user = userRepository.findById(inst.getUserId())
                            .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));

                    UserDTO userDTO = new UserDTO(
                            user.getUserId(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getRole()
                    );

                    return new InstructorWithUserDTO(inst, userDTO);
                })
                .collect(Collectors.toList());
    }

}