package com.autoskola.financeservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CandidateStatusDTO {
    private Integer candidateId;
    private boolean enrollmentEligible;  // upisnina (300 KM) u potpunosti plaćena
    private boolean examEligible;        // cijeli iznos (1900 KM) plaćen
    private BigDecimal totalAmount;      // 1900.00
    private BigDecimal paidAmount;       // ukupno plaćeno do sad
    private BigDecimal remainingDebt;    // preostalo
    private List<ObligationDTO> obligations;
}
