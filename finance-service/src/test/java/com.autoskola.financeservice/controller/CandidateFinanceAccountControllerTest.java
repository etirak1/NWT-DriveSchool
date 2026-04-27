package com.autoskola.financeservice.controller;

import com.autoskola.financeservice.dto.CandidateFinanceAccountDTO;
import com.autoskola.financeservice.service.FinanceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CandidateFinanceAccountController.class)
public class CandidateFinanceAccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FinanceService financeService;

    @MockBean
    private com.autoskola.financeservice.repository.UserRepository userRepository;

    @MockBean
    private com.autoskola.financeservice.repository.CandidateFinanceAccountRepository candidateFinanceAccountRepository;

    @MockBean
    private com.autoskola.financeservice.repository.PaymentRepository paymentRepository;

    @Test
    void shouldReturnAccountDto() throws Exception {
        CandidateFinanceAccountDTO dto = new CandidateFinanceAccountDTO();
        dto.setId(1);
        dto.setRemainingDebt(new BigDecimal("500.00"));

        when(financeService.getAccountById(1)).thenReturn(dto);

        mockMvc.perform(get("/accounts/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.remainingDebt").value(500.00));
    }
}