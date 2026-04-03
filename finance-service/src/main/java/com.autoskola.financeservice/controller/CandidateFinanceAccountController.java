package com.autoskola.financeservice.controller;

import com.autoskola.financeservice.model.CandidateFinanceAccount;
import com.autoskola.financeservice.model.Payment;
import com.autoskola.financeservice.repository.CandidateFinanceAccountRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal; // OBAVEZAN IMPORT
import java.util.List;

@RestController
@RequestMapping("/accounts")
public class CandidateFinanceAccountController {

    private final CandidateFinanceAccountRepository accountRepository;

    public CandidateFinanceAccountController(CandidateFinanceAccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @GetMapping
    public List<CandidateFinanceAccount> getAll() {
        return accountRepository.findAll();
    }

    @GetMapping("/{id}")
    public CandidateFinanceAccount getById(@PathVariable Integer id) {
        return accountRepository.findById(id).orElse(null);
    }

    @GetMapping("/{id}/debt")
    public BigDecimal getRemainingDebt(@PathVariable Integer id) {
        CandidateFinanceAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        BigDecimal paidAmount = account.getPayments().stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Ako je totalAmount null (nisi ga unijela), vrati nulu ili postavi default
        BigDecimal total = account.getTotalAmount() != null ? account.getTotalAmount() : BigDecimal.ZERO;
        return total.subtract(paidAmount);
    }
}