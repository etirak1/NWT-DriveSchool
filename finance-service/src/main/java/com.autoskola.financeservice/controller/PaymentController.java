package com.autoskola.financeservice.controller;

import com.autoskola.financeservice.model.Payment;
import com.autoskola.financeservice.repository.PaymentRepository;
import jakarta.validation.Valid; // OBAVEZAN IMPORT ZA VALIDACIJU
import org.springframework.http.ResponseEntity; // OBAVEZAN IMPORT
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;

    public PaymentController(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @GetMapping("/candidate/{candidateId}")
    public List<Payment> getPaymentsByCandidate(@PathVariable Integer candidateId) {
        return paymentRepository.findByCandidateAccount_Id(candidateId);
    }


    @PostMapping
    public ResponseEntity<Payment> createPayment(@Valid @RequestBody Payment payment) {

        Payment savedPayment = paymentRepository.save(payment);
        return ResponseEntity.ok(savedPayment);
    }
}