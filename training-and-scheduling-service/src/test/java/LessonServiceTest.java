import com.autoskola.trainingservice.dto.LessonWithUsersDTO;
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

import java.time.LocalDateTime;
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

        Instructor instructor = new Instructor(1L, 10L);
        Candidate candidate = new Candidate(1L, 20L, null, null, instructor, null);
        Lesson lesson = new Lesson(1L, candidate, instructor, 1L,
                LocalDateTime.now(), 45, "ZAKAZANO", "Notes");

        when(lessonRepository.findById(1L)).thenReturn(Optional.of(lesson));

        // ✅ koristi UserService
        when(userService.getUserById(10L))
                .thenReturn(new UserDTO(10L, "Emina", "Omerović", "INSTRUCTOR"));

        when(userService.getUserById(20L))
                .thenReturn(new UserDTO(20L, "Tajra", "Ljubović", "CANDIDATE"));

        LessonWithUsersDTO result = lessonService.getLessonDetails(1L);

        assertNotNull(result);
        assertEquals("Emina", result.getInstructor().getFirstName());
        assertEquals("Tajra", result.getCandidate().getFirstName());
    }
}