package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.dto.UserDTO;
import com.autoskola.resourceservice.mapper.InstructorMapper;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.service.InstructorService;
import com.autoskola.resourceservice.service.UserClientService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InstructorController.class)
@ActiveProfiles("test")
class InstructorIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InstructorService instructorService;

    @MockBean
    private UserClientService userClientService;

    @MockBean
    private InstructorMapper instructorMapper;

    @Test
    void shouldReturnInstructorWithUser() throws Exception {

        Instructor instructor = new Instructor();
        instructor.setInstructorId(1L);
        instructor.setUserId(10L);

        UserDTO user = new UserDTO(10L, "Azra", "Trako", "a@mail.com", "INSTRUCTOR");

        when(instructorService.getById(1L)).thenReturn(instructor);
        when(userClientService.getUserById(10L)).thenReturn(user);
        when(instructorMapper.toDTO(instructor, user))
                .thenReturn(new com.autoskola.resourceservice.dto.InstructorWithUserDTO(instructor, user));

        mockMvc.perform(get("/instructors/1"))
                .andExpect(status().isOk());
    }
}
