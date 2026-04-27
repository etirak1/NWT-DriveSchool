package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.model.Vehicle;
import com.autoskola.resourceservice.repository.VehicleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VehicleController.class)
@ActiveProfiles("test")
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VehicleRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    private Vehicle sample() {
        Vehicle v = new Vehicle();
        v.setVehicleId(1L);
        v.setBrand("BMW");
        v.setModel("X5");

        v.setRegistrationNumber("123-A-456");
        v.setStatus("ACTIVE");
        v.setLastTechnicalInspection(LocalDateTime.now());
        v.setRegistrationDate(LocalDateTime.now());

        return v;
    }

    @Test
    void shouldGetAllVehicles() throws Exception {
        when(repository.findAll()).thenReturn(List.of(sample()));

        mockMvc.perform(get("/vehicles"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetVehicleById() throws Exception {
        when(repository.findById(1L))
                .thenReturn(Optional.of(sample()));

        mockMvc.perform(get("/vehicles/1"))
                .andExpect(status().isOk());
    }


    @Test
    void shouldCreateVehicle() throws Exception {
        Vehicle v = sample();

        when(repository.save(any())).thenReturn(v);

        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(v)))
                .andExpect(status().isOk());
    }


    @Test
    void shouldFailValidationWhenCreatingVehicle() throws Exception {
        Vehicle invalid = new Vehicle();
        invalid.setBrand("BMW");
        invalid.setModel("X5");
        invalid.setRegistrationNumber(null);
        invalid.setStatus(null);

        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }


    @Test
    void shouldUpdateVehicle() throws Exception {
        Vehicle v = sample();

        when(repository.findById(1L)).thenReturn(Optional.of(v));
        when(repository.save(any())).thenReturn(v);

        mockMvc.perform(put("/vehicles/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(v)))
                .andExpect(status().isOk());
    }


    @Test
    void shouldDeleteVehicle() throws Exception {

        doNothing().when(repository).deleteById(1L);

        mockMvc.perform(delete("/vehicles/1"))
                .andExpect(status().isNoContent());
    }
}