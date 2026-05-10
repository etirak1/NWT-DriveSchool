package com.autoskola.userservice;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.autoskola.userservice.client.TrainingClient;
import com.autoskola.userservice.model.User;
import com.autoskola.userservice.repository.UserRepository;
import com.autoskola.userservice.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

@ActiveProfiles("test")
@SpringBootTest
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private TrainingClient trainingClient;

    @Test
    void deleteInstructor_WhenHasActiveSessions_ShouldThrowException() {

        Long userId = 1L;
        User instructor = new User(userId, "Ime", "Prezime", "email@ba", "123", "INSTRUKTOR", "ACTIVE", null);

        when(userRepository.findById(userId)).thenReturn(Optional.of(instructor));

        when(trainingClient.hasActiveSessions(userId)).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.deleteOrDeactivateInstructor(userId);
        });

        assertTrue(exception.getMessage().contains("aktivne termine vožnje"));
        verify(userRepository, never()).deleteById(userId);
    }

    @Test
    void deleteInstructor_WhenNoActiveSessions_ShouldDeleteSuccessfully() {

        Long userId = 2L;
        User instructor = new User(userId, "Ime", "Prezime", "email@ba", "123", "INSTRUKTOR", "ACTIVE", null);

        when(userRepository.findById(userId)).thenReturn(Optional.of(instructor));
        when(trainingClient.hasActiveSessions(userId)).thenReturn(false);

        assertDoesNotThrow(() -> userService.deleteOrDeactivateInstructor(userId));

        verify(userRepository, times(1)).deleteById(userId);
    }

    @Test
    void deleteInstructor_WhenUserDoesNotExist_ShouldThrowNotFoundException() {
        Long nonExistingId = 999L;

        when(userRepository.findById(nonExistingId)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            userService.deleteOrDeactivateInstructor(nonExistingId);
        });

        assertEquals("Korisnik nije pronadjen", exception.getMessage());
        verify(trainingClient, never()).hasActiveSessions(anyLong());

        verify(userRepository, never()).deleteById(anyLong());
    }
}