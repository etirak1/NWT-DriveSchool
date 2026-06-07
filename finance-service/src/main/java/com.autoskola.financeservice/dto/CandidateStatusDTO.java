package com.autoskola.financeservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CandidateStatusDTO {
    private Integer candidateId;
    private boolean enrollmentEligible;
    private boolean examEligible;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingDebt;
    private List<ObligationDTO> obligations;
}
