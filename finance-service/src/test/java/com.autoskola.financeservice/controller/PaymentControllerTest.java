package com.autoskola.financeservice.controller;

import com.autoskola.financeservice.model.Payment;
import com.autoskola.financeservice.repository.PaymentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(PaymentController.class)
@org.springframework.test.context.ActiveProfiles("test")
public class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentRepository paymentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetPaymentsByCandidate() throws Exception {
        Payment p1 = new Payment(1, new BigDecimal("100.00"), LocalDate.now(), "PAID", LocalDate.now(), null);

        Mockito.when(paymentRepository.findByCandidateAccount_Id(48))
                .thenReturn(Arrays.asList(p1));

        mockMvc.perform(get("/payments/candidate/48"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].amount", is(100.00)));
    }

    @Test
    void testCreatePayment_Success() throws Exception {
        Payment payment = new Payment(null, new BigDecimal("500.00"), LocalDate.now(), "PAID", LocalDate.now(), null);
        Payment savedPayment = new Payment(10, new BigDecimal("500.00"), LocalDate.now(), "PAID", LocalDate.now(), null);

        Mockito.when(paymentRepository.save(Mockito.any(Payment.class))).thenReturn(savedPayment);

        mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payment)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId", is(10)));
    }

    @Test
    void testCreatePayment_ValidationFailed() throws Exception {
        Payment invalidPayment = new Payment(null, new BigDecimal("-50.00"), LocalDate.now(), "GRESKA", null, null);

        mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPayment)))
                .andExpect(status().isBadRequest());
    }
}