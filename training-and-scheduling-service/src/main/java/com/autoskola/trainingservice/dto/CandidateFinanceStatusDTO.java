package com.autoskola.trainingservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CandidateFinanceStatusDTO {

    private boolean examEligible;
    private BigDecimal remainingDebt;

    public boolean isExamEligible() { return examEligible; }
    public void setExamEligible(boolean examEligible) { this.examEligible = examEligible; }

    public BigDecimal getRemainingDebt() { return remainingDebt; }
    public void setRemainingDebt(BigDecimal remainingDebt) { this.remainingDebt = remainingDebt; }
}
