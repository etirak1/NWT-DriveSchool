package com.autoskola.trainingservice;
import com.autoskola.trainingservice.controller.FeedbackController;
import com.autoskola.trainingservice.dto.FeedbackDTO;
import com.autoskola.trainingservice.model.Candidate;
import com.autoskola.trainingservice.model.Feedback;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.service.FeedbackService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@ActiveProfiles("test")
@WebMvcTest(FeedbackController.class)
class FeedbackControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FeedbackService feedbackService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getFeedback_Success() throws Exception {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setFeedbackId(1L);
        dto.setRating(5);
        dto.setComment("Odličan instruktor");

        when(feedbackService.getFeedbackDetails(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/feedbacks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.feedbackId").value(1))
                .andExpect(jsonPath("$.rating").value(5));
    }

    @Test
    void getFeedback_NotFound() throws Exception {

        when(feedbackService.getFeedbackDetails(999L))
                .thenThrow(new RuntimeException("Ocjena nije pronađena"));

        mockMvc.perform(get("/api/feedbacks/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void leaveFeedback_Success() throws Exception {

        Feedback feedback = new Feedback();
        feedback.setRating(5);
        feedback.setComment("Super instruktor");

        // Dodajemo lažne objekte da validacija ne baci 400
        feedback.setCandidate(new Candidate());
        feedback.setInstructor(new Instructor());

        FeedbackDTO dto = new FeedbackDTO();
        dto.setFeedbackId(1L);
        dto.setRating(5);
        dto.setComment("Super instruktor");

        when(feedbackService.createFeedback(any(Feedback.class))).thenReturn(dto);

        mockMvc.perform(post("/api/feedbacks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(feedback)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.feedbackId").value(1));
    }


    @Test
    void leaveFeedback_InvalidRating_Returns400() throws Exception {
        Feedback invalidFeedback = new Feedback();
        invalidFeedback.setRating(10);
        invalidFeedback.setComment("Loša ocjena");

        mockMvc.perform(post("/api/feedbacks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidFeedback)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }
}