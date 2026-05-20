package com.autoskola.resourceservice.service;

import com.autoskola.resourceservice.dto.InstructorDTO;
import com.autoskola.resourceservice.dto.UserDTO;
import com.autoskola.resourceservice.exception.ResourceNotFoundException;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.model.User;
import com.autoskola.resourceservice.repository.InstructorRepository;
import com.autoskola.resourceservice.repository.UserRepository;
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

    public InstructorDTO getInstructorFullDetails(Long id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instruktor nije pronađen"));

        User user = userRepository.findById(instructor.getUserId())
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));

        UserDTO userDTO = new UserDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );

        return new InstructorDTO(instructor.getInstructorId(), userDTO);
    }

    public InstructorDTO createInstructor(Instructor instructor) {

        userRepository.findById(instructor.getUserId())
                .orElseThrow(() -> new RuntimeException("Korisnik sa ID-om " + instructor.getUserId() + " ne postoji."));
        Instructor saved = instructorRepository.save(instructor);

        return getInstructorFullDetails(saved.getInstructorId());
    }

    public List<InstructorDTO> getAllInstructors() {
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

                    return new InstructorDTO(inst.getInstructorId(), userDTO);
                })
                .collect(Collectors.toList());
    }

    public Instructor getById(Long id) {
        return instructorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instruktor nije pronađen"));
    }

    public List<Instructor> getAll() {
        return instructorRepository.findAll();
    }
}