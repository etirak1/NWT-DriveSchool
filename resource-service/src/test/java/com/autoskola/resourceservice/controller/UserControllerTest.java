package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.model.User;
import com.autoskola.resourceservice.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private UserRepository userRepository;
    @Autowired private ObjectMapper objectMapper;

    private User sampleUser() {
        User u = new User();
        u.setUserId(1L);
        u.setFirstName("Test");
        u.setLastName("User");
        u.setEmail("test@test.com");
        u.setPasswordHash("pass123");
        u.setRole("ADMIN");
        u.setStatus("ACTIVE");
        return u;
    }

    @Test
    void shouldGetAllUsers() throws Exception {
        when(userRepository.findAll()).thenReturn(List.of(sampleUser()));

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetUserById() throws Exception {
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(sampleUser()));

        mockMvc.perform(get("/users/1"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldCreateUser() throws Exception {
        when(userRepository.save(any())).thenReturn(sampleUser());

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleUser())))
                .andExpect(status().isOk());
    }

    @Test
    void shouldUpdateUser() throws Exception {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser()));
        when(userRepository.save(any())).thenReturn(sampleUser());

        mockMvc.perform(put("/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleUser())))
                .andExpect(status().isOk());
    }

    @Test
    void shouldDeleteUser() throws Exception {
        mockMvc.perform(delete("/users/1"))
                .andExpect(status().isOk());
    }
}