import com.autoskola.trainingservice.TrainingServiceApplication;
import com.autoskola.trainingservice.controller.TrainingRuleController;
import com.autoskola.trainingservice.dto.TrainingRuleDTO;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@SpringBootTest(classes = TrainingServiceApplication.class)
@AutoConfigureMockMvc
class TrainingRuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TrainingRuleRepository ruleRepository;

    @MockBean
    private ModelMapper modelMapper;

    @Test
    void whenPostInvalidRule_thenReturns400() throws Exception {

        TrainingRuleDTO invalidDto =
                new TrainingRuleDTO(null, 2, 35, 45, new BigDecimal("-100.00"));

        mockMvc.perform(post("/api/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void whenPostValidRule_thenReturns200() throws Exception {

        TrainingRuleDTO validDto =
                new TrainingRuleDTO(null, 30, 35, 45, new BigDecimal("1200.00"));

        mockMvc.perform(post("/api/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDto)))
                .andExpect(status().isOk());
    }
}