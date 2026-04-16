package com.autoskola.resourceservice.service;

import com.autoskola.resourceservice.exception.ResourceNotFoundException;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.repository.InstructorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstructorService {

    private final InstructorRepository instructorRepository;

    public InstructorService(InstructorRepository instructorRepository) {
        this.instructorRepository = instructorRepository;
    }

    public Instructor getById(Long id) {
        return instructorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instruktor nije pronađen"));
    }

    public List<Instructor> getAll() {
        return instructorRepository.findAll();
    }
}