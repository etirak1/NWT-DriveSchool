package com.autoskola.financeservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CandidateFinanceAccountDTO {
    private Integer id;
    private UserDTO user;
    private LocalDate enrollmentDate;
    private BigDecimal progressPercentage;
    private BigDecimal totalAmount;
    private BigDecimal remainingDebt;
    private List<PaymentDTO> payments;

}