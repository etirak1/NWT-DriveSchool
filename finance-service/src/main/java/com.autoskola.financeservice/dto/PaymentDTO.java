package com.autoskola.financeservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentDTO {
    private Integer paymentId;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String status;
    private LocalDate datePaid;
}