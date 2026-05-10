package com.autoskola.trainingservice;

import com.autoskola.trainingservice.dto.LessonDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.repository.LessonRepository;
import com.autoskola.trainingservice.service.LessonService;
import com.autoskola.trainingservice.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LessonServiceTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private LessonService lessonService;


    @Test
    void testGetLessonDetails_Success() {

        Instructor instructor = new Instructor();
        instructor.setInstructorId(1L);
        instructor.setUserId(10L);

        Candidate candidate = new Candidate();
        candidate.setCandidateId(1L);
        candidate.setUserId(20L);
        candidate.setAssignedInstructor(instructor);

        Lesson lesson = new Lesson();
        lesson.setLessonId(1L);
        lesson.setCandidate(candidate);
        lesson.setInstructor(instructor);
        lesson.setVehicleId(1L);
        lesson.setDuration(45);
        lesson.setStatus("ZAKAZANO");

        when(lessonRepository.findById(1L)).thenReturn(Optional.of(lesson));

        when(userService.getUserById(10L))
                .thenReturn(new UserDTO(10L, "Emina", "Omerović", "INSTRUCTOR"));

        when(userService.getUserById(20L))
                .thenReturn(new UserDTO(20L, "Tajra", "Ljubović", "CANDIDATE"));

        LessonDTO result = lessonService.getLessonDetails(1L);

        assertNotNull(result);
        assertEquals("Emina", result.getInstructor().getFirstName());
        assertEquals("Tajra", result.getCandidate().getFirstName());
    }


        @Test
        void hasActiveSessions_ShouldReturnTrue_WhenLessonsExist() {
            Long userId = 10L;
            when(lessonRepository.findUpcomingByInstructorUserId(userId))
                    .thenReturn(List.of(new Lesson()));

            boolean result = lessonService.hasActiveSessions(userId);

            assertTrue(result);
        }

}