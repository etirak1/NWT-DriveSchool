package com.autoskola.financeservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "obligations")
@Getter @Setter @NoArgsConstructor
public class Obligation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @JsonIgnore
    private CandidateFinanceAccount account;

    @Column(nullable = false)
    private int orderIndex;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    public BigDecimal getRemainingAmount() {
        return totalAmount.subtract(paidAmount).max(BigDecimal.ZERO);
    }

    public boolean isFullyPaid() {
        return paidAmount.compareTo(totalAmount) >= 0;
    }
}
