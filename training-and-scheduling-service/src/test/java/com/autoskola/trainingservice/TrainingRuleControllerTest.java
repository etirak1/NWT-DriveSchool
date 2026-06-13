package com.autoskola.trainingservice;

import com.autoskola.trainingservice.controller.TrainingRuleController;
import com.autoskola.trainingservice.dto.TrainingRuleDTO;
import com.autoskola.trainingservice.model.TrainingRule;
import com.autoskola.trainingservice.repository.TrainingRuleRepository;
import com.autoskola.trainingservice.service.TrainingRuleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@WebMvcTest(TrainingRuleController.class)
class TrainingRuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TrainingRuleRepository ruleRepository;

    @MockBean
    private ModelMapper modelMapper;

   @MockBean
   private TrainingRuleService ruleService;

    @Test
    void whenPostInvalidRule_thenReturns400() throws Exception {
        TrainingRuleDTO invalidDto =
                new TrainingRuleDTO(null, 2, 35, 45, new BigDecimal("-100.00"), 3);

        mockMvc.perform(post("/api/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void whenPostValidRule_thenReturns200() throws Exception {
        TrainingRuleDTO validDto =
                new TrainingRuleDTO(null, 30, 35, 45, new BigDecimal("1200.00"), 2);

        TrainingRule mockRule = new TrainingRule();
        when(modelMapper.map(any(TrainingRuleDTO.class), eq(TrainingRule.class))).thenReturn(mockRule);
        when(ruleRepository.save(any(TrainingRule.class))).thenReturn(mockRule);
        when(modelMapper.map(any(TrainingRule.class), eq(TrainingRuleDTO.class))).thenReturn(validDto);

        mockMvc.perform(post("/api/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDto)))
                .andExpect(status().isOk());
    }
}