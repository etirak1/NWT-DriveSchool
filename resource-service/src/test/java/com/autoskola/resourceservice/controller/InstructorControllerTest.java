package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.mapper.InstructorMapper;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.repository.InstructorRepository;
import com.autoskola.resourceservice.repository.UserRepository;
import com.autoskola.resourceservice.service.InstructorService;
import com.autoskola.resourceservice.service.UserClientService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@WebMvcTest(InstructorController.class)
class InstructorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InstructorService instructorService;

    @MockBean
    private InstructorMapper instructorMapper;

    @MockBean
    private UserClientService userClientService;

    @Test
    void shouldReturnAllInstructors() throws Exception {

        Instructor instructor = new Instructor();
        instructor.setInstructorId(1L);
        instructor.setUserId(10L);
        instructor.setAvailabilityNote("Available");

        when(instructorService.getAll()).thenReturn(List.of(instructor));

        mockMvc.perform(get("/instructors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].userId").value(10));
    }
}