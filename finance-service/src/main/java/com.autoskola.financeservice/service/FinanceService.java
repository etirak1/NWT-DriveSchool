package com.autoskola.financeservice.service;

import com.autoskola.financeservice.dto.CandidateFinanceAccountDTO;
import com.autoskola.financeservice.dto.PaymentDTO;
import com.autoskola.financeservice.model.CandidateFinanceAccount;
import com.autoskola.financeservice.model.Payment;
import com.autoskola.financeservice.repository.CandidateFinanceAccountRepository;
import com.autoskola.financeservice.repository.PaymentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FinanceService {

    private final CandidateFinanceAccountRepository accountRepository;
    private final PaymentRepository paymentRepository;
    private final ModelMapper modelMapper;

    public FinanceService(CandidateFinanceAccountRepository accountRepository,
                          PaymentRepository paymentRepository,
                          ModelMapper modelMapper) {
        this.accountRepository = accountRepository;
        this.paymentRepository = paymentRepository;
        this.modelMapper = modelMapper;
    }

    public List<CandidateFinanceAccountDTO> getAllAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CandidateFinanceAccountDTO getAccountById(Integer id) {
        CandidateFinanceAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return convertToDto(account);
    }

    public List<PaymentDTO> getPaymentsByCandidate(Integer candidateId) {
        return paymentRepository.findByCandidateAccount_Id(candidateId)
                .stream()
                .map(payment -> modelMapper.map(payment, PaymentDTO.class))
                .collect(Collectors.toList());
    }

    private CandidateFinanceAccountDTO convertToDto(CandidateFinanceAccount account) {

        CandidateFinanceAccountDTO dto =
                modelMapper.map(account, CandidateFinanceAccountDTO.class);

        // 🔥 SAFE HANDLING (izbjegava null + lazy errors)
        List<Payment> payments =
                account.getPayments() != null ? account.getPayments() : List.of();

        BigDecimal paidAmount = payments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal total = account.getTotalAmount() != null
                ? account.getTotalAmount()
                : BigDecimal.ZERO;

        dto.setRemainingDebt(total.subtract(paidAmount));

        return dto;
    }
}