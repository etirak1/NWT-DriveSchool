package com.autoskola.financeservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "candidate_accounts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class CandidateFinanceAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "candidate_id") // PK sa dijagrama
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id") // FK sa dijagrama
    private User user;

    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;

    @Column(name = "progress_percentage", precision = 5, scale = 2)
    private BigDecimal progressPercentage;

    @Column(name = "assigned_instructor_id")
    private Integer assignedInstructorId;

    @Column(name = "rule_id")
    private Integer ruleId;

    // Ovo polje ti treba za tvoj finansijski servis (ukupna cijena obuke)
    private BigDecimal totalAmount;

    @OneToMany(mappedBy = "candidateAccount", cascade = CascadeType.ALL)
    private List<Payment> payments;
}