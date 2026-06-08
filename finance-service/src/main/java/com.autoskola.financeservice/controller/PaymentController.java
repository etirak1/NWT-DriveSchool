package com.autoskola.financeservice.controller;

import com.autoskola.financeservice.model.CandidateFinanceAccount;
import com.autoskola.financeservice.model.Payment;
import com.autoskola.financeservice.repository.CandidateFinanceAccountRepository;
import com.autoskola.financeservice.repository.PaymentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final CandidateFinanceAccountRepository accountRepository;

    public PaymentController(PaymentRepository paymentRepository,
                             CandidateFinanceAccountRepository accountRepository) {
        this.paymentRepository = paymentRepository;
        this.accountRepository = accountRepository;
    }

    @GetMapping("/candidate/{candidateId}")
    public List<Payment> getPaymentsByCandidate(@PathVariable Integer candidateId) {
        return paymentRepository.findByCandidateAccount_Id(candidateId);
    }


    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody PaymentRequest req) {
        CandidateFinanceAccount account = accountRepository.findById(req.getCandidateAccountId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Kandidat nije pronađen: " + req.getCandidateAccountId()));

        Payment payment = new Payment();
        payment.setAmount(req.getAmount());
        payment.setDueDate(req.getDueDate());
        payment.setStatus(req.getStatus() != null ? req.getStatus() : "PENDING");
        payment.setDatePaid(req.getDatePaid());
        payment.setCandidateAccount(account);

        Payment saved = paymentRepository.save(payment);
        return ResponseEntity.ok(saved);
    }


    public static class PaymentRequest {
        private Integer candidateAccountId;
        private java.math.BigDecimal amount;
        private java.time.LocalDate dueDate;
        private String status;
        private java.time.LocalDate datePaid;

        public Integer getCandidateAccountId() { return candidateAccountId; }
        public void setCandidateAccountId(Integer v) { this.candidateAccountId = v; }
        public java.math.BigDecimal getAmount() { return amount; }
        public void setAmount(java.math.BigDecimal v) { this.amount = v; }
        public java.time.LocalDate getDueDate() { return dueDate; }
        public void setDueDate(java.time.LocalDate v) { this.dueDate = v; }
        public String getStatus() { return status; }
        public void setStatus(String v) { this.status = v; }
        public java.time.LocalDate getDatePaid() { return datePaid; }
        public void setDatePaid(java.time.LocalDate v) { this.datePaid = v; }
    }
}