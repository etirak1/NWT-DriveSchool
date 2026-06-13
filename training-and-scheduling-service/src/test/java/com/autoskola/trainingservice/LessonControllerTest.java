package com.autoskola.trainingservice;

import com.autoskola.trainingservice.controller.LessonController;
import com.autoskola.trainingservice.dto.LessonDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.repository.UserRepository;
import com.autoskola.trainingservice.service.LessonService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@WebMvcTest(LessonController.class)
class LessonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LessonService lessonService;

    @Autowired
    private ObjectMapper objectMapper;


    @Test
    void getLesson_Success() throws Exception {
        LessonDTO dto = new LessonDTO();
        dto.setLessonId(1L);

        when(lessonService.getLessonDetails(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/lessons/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lessonId").value(1));
    }

    @Test
    void getLesson_NotFound() throws Exception {
        when(lessonService.getLessonDetails(999L))
                .thenThrow(new RuntimeException("Not found"));

        mockMvc.perform(get("/api/lessons/999"))
                .andExpect(status().isNotFound());
    }


    @Test
    void getAllLessons_Success() throws Exception {
        LessonDTO dto = new LessonDTO();
        dto.setLessonId(1L);

        when(lessonService.getAllLessons()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/lessons"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void scheduleLesson_Success() throws Exception {
        Lesson lesson = new Lesson();

        lesson.setCandidate(new com.autoskola.trainingservice.model.Candidate());
        lesson.setInstructor(new com.autoskola.trainingservice.model.Instructor());
        lesson.setVehicleId(1L);
        lesson.setDateTime(java.time.LocalDateTime.now().plusDays(1));
        lesson.setDuration(45);
        lesson.setStatus("ZAKAZANO");
        lesson.setNotes("Test");

        LessonDTO dto = new LessonDTO();
        dto.setLessonId(1L);

        when(lessonService.saveLesson(org.mockito.ArgumentMatchers.any(Lesson.class))).thenReturn(dto);

        mockMvc.perform(post("/api/lessons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lesson)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lessonId").value(1));
    }


    @Test
    void completeLesson_Success() throws Exception {
        when(lessonService.completeLessonAndIncreaseProgress(eq(1L), anyString(), anyString()))
                .thenReturn("Lesson završen");

        mockMvc.perform(post("/api/lessons/1/complete"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("završen")));
    }


    @Test
    void getLessonsPaged_Success() throws Exception {
        LessonDTO dto = new LessonDTO();
        dto.setLessonId(1L);

        when(lessonService.getAllLessonsPaged(org.mockito.ArgumentMatchers.any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(dto)));

        mockMvc.perform(get("/api/lessons/paged?page=0&size=2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }


    @Test
    void patchLessonNotes_Success() throws Exception {
        LessonDTO dto = new LessonDTO();
        dto.setNotes("Kandidat opravdano odsutan");

        when(lessonService.patchLessonNotes(eq(1L), anyString()))
                .thenReturn(dto);

        mockMvc.perform(patch("/api/lessons/1/notes")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("Kandidat opravdano odsutan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes")
                        .value("Kandidat opravdano odsutan"));
    }
}