package com.autoskola.financeservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ObligationDTO {
    private Integer id;
    private int orderIndex;
    private String label;
    private String type;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private boolean fullyPaid;
}
