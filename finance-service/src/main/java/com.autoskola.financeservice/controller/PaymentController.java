package com.autoskola.financeservice.controller;

import com.autoskola.financeservice.model.Payment;
import com.autoskola.financeservice.repository.PaymentRepository;
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
        // Koristimo metodu koju smo dodali u PaymentRepository
        return paymentRepository.findByCandidateAccount_Id(candidateId);
    }
}