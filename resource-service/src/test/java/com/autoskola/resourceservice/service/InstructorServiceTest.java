package com.autoskola.resourceservice.service;

import com.autoskola.resourceservice.exception.ResourceNotFoundException;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.repository.InstructorRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InstructorServiceTest {

    private final InstructorRepository repository = mock(InstructorRepository.class);
    private final InstructorService service = new InstructorService(repository);

    @Test
    void shouldReturnInstructor_whenExists() {
        Instructor instructor = new Instructor();
        instructor.setInstructorId(1L);

        when(repository.findById(1L)).thenReturn(Optional.of(instructor));

        Instructor result = service.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getInstructorId());
    }

    @Test
    void shouldThrowException_whenInstructorNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            service.getById(1L);
        });
    }

    @Test
    void shouldReturnAllInstructors() {
        when(repository.findAll()).thenReturn(List.of(new Instructor()));

        List<Instructor> result = service.getAll();

        assertEquals(1, result.size());
    }
}