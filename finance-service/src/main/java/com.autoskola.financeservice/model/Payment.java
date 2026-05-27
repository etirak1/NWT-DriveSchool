package com.autoskola.financeservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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

    @NotNull(message = "Iznos uplate je obavezan")
    @DecimalMin(value = "0.0", inclusive = false, message = "Iznos mora biti veći od 0")
    private BigDecimal amount;

    @NotNull(message = "Datum dospijeća je obavezan")
    private LocalDate dueDate;

    @NotBlank(message = "Status uplate je obavezan")
    @Pattern(regexp = "PAID|PENDING|CANCELLED", message = "Status mora biti PAID, PENDING ili CANCELLED")
    private String status;

    private LocalDate datePaid;

    @ManyToOne
    @JoinColumn(name = "candidate_account_id")
    @JsonIgnoreProperties({"payments"})
    private CandidateFinanceAccount candidateAccount;
}

