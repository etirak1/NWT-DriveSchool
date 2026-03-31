package com.autoskola.financeservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer paymentId;

    private BigDecimal amount;
    private LocalDate dueDate;
    private String status;
    private LocalDate datePaid;

    @ManyToOne
    @JoinColumn(name = "candidate_account_id")
    private CandidateFinanceAccount candidateAccount;
}