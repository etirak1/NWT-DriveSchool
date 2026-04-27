package com.autoskola.financeservice.service;

import com.autoskola.financeservice.dto.CandidateFinanceAccountDTO;
import com.autoskola.financeservice.model.CandidateFinanceAccount;
import com.autoskola.financeservice.model.Payment;
import com.autoskola.financeservice.repository.CandidateFinanceAccountRepository;
import com.autoskola.financeservice.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FinanceServiceTest {

    @Mock
    private CandidateFinanceAccountRepository accountRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private FinanceService financeService;

    private CandidateFinanceAccount account;

    @BeforeEach
    void setUp() {
        account = new CandidateFinanceAccount();
        account.setId(1);
        account.setTotalAmount(new BigDecimal("1000.00"));

        Payment p1 = new Payment();
        p1.setAmount(new BigDecimal("400.00"));
        p1.setStatus("PAID");

        Payment p2 = new Payment();
        p2.setAmount(new BigDecimal("200.00"));
        p2.setStatus("PENDING");

        account.setPayments(Arrays.asList(p1, p2));
    }

    @Test
    void testCalculateRemainingDebt() {
        // Arrange
        when(accountRepository.findById(1)).thenReturn(Optional.of(account));

        // Act
        CandidateFinanceAccountDTO result = financeService.getAccountById(1);

        // Assert: 1000 (total) - 400 (paid) = 600 (debt)
        assertEquals(new BigDecimal("600.00"), result.getRemainingDebt());
        assertEquals(1, result.getId());
    }
}