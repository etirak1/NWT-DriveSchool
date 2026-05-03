package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.model.Repairs;
import com.autoskola.resourceservice.model.Vehicle;
import com.autoskola.resourceservice.repository.RepairsRepository;
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
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;



@WebMvcTest(RepairsController.class)
@ActiveProfiles("test")
class RepairsControllerTest {

    @Autowired
    private MockMvc mockMvc;


    @MockBean
    private RepairsRepository repairsRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Repairs getSampleRepair() {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleId(1L);

        Repairs repair = new Repairs();
        repair.setRepairId(1L);
        repair.setVehicle(vehicle);
        repair.setDescription("Test repair");
        repair.setCost(100.0);
        repair.setRepairDate(LocalDateTime.now());

        return repair;
    }


    @Test
    void shouldReturnAllRepairs() throws Exception {
        when(repairsRepository.findAllWithVehicle())
                .thenReturn(List.of(getSampleRepair()));

        mockMvc.perform(get("/repairs"))
                .andExpect(status().isOk());
    }


    @Test
    void shouldReturnRepairById() throws Exception {
        when(repairsRepository.findById(1L))
                .thenReturn(Optional.of(getSampleRepair()));

        mockMvc.perform(get("/repairs/1"))
                .andExpect(status().isOk());
    }


    @Test
    void shouldReturn404WhenRepairNotFound() throws Exception {
        when(repairsRepository.findById(1L))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/repairs/1"))
                .andExpect(status().isInternalServerError());
    }


    @Test
    void shouldCreateRepair() throws Exception {
        Repairs repair = getSampleRepair();

        when(repairsRepository.save(any(Repairs.class)))
                .thenReturn(repair);

        mockMvc.perform(post("/repairs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(repair)))
                .andExpect(status().isOk());
    }


    @Test
    void shouldUpdateRepair() throws Exception {
        Repairs repair = getSampleRepair();

        when(repairsRepository.findById(1L))
                .thenReturn(Optional.of(repair));

        when(repairsRepository.save(any()))
                .thenReturn(repair);

        mockMvc.perform(put("/repairs/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(repair)))
                .andExpect(status().isOk());
    }


    @Test
    void shouldPatchRepair() throws Exception {
        Repairs repair = getSampleRepair();

        when(repairsRepository.findById(1L))
                .thenReturn(Optional.of(repair));

        when(repairsRepository.save(any()))
                .thenReturn(repair);

        Map<String, Object> updates = Map.of("cost", 500);

        mockMvc.perform(patch("/repairs/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());
    }

    @Test
    void shouldDeleteRepair() throws Exception {
        when(repairsRepository.existsById(1L))
                .thenReturn(true);

        mockMvc.perform(delete("/repairs/1"))
                .andExpect(status().isNoContent());
    }


    @Test
    void shouldReturnErrorWhenDeletingNonExisting() throws Exception {
        when(repairsRepository.existsById(1L))
                .thenReturn(false);

        mockMvc.perform(delete("/repairs/1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldCreateBatch() throws Exception {
        List<Repairs> repairsList = List.of(getSampleRepair());

        when(repairsRepository.saveAll(any()))
                .thenReturn(repairsList);

        mockMvc.perform(post("/repairs/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(repairsList)))
                .andExpect(status().isOk());
    }


    @Test
    void shouldReturnExpensiveRepairs() throws Exception {
        when(repairsRepository.findExpensiveRepairs(200.0))
                .thenReturn(List.of(getSampleRepair()));

        mockMvc.perform(get("/repairs/expensive?cost=200"))
                .andExpect(status().isOk());
    }
}