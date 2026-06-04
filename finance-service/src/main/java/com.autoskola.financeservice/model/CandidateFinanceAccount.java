package com.autoskola.financeservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "candidate_accounts")
@Getter @Setter
@NoArgsConstructor
public class CandidateFinanceAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "candidate_id")
    private Integer id;

    // NOVO — referenca na kandidata iz User servicea
    @Column(name = "candidate_ref_id")
    private Integer candidateId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @NotNull(message = "Korisnik mora biti povezan sa nalogom")
    private User user;

    private LocalDate enrollmentDate;

    @DecimalMin(value = "0.0", message = "Progres ne može biti negativan")
    @DecimalMax(value = "100.0", message = "Progres ne može biti veći od 100")
    private BigDecimal progressPercentage;

    private Integer assignedInstructorId;
    private Integer ruleId;

    @NotNull(message = "Ukupna cijena obuke je obavezna")
    @DecimalMin(value = "0.0", message = "Cijena ne može biti negativna")
    private BigDecimal totalAmount;

    // NOVO — preostali dug
    @DecimalMin(value = "0.0", message = "Dug ne može biti negativan")
    private BigDecimal remainingDebt;

    @OneToMany(mappedBy = "candidateAccount", cascade = CascadeType.ALL)
    private List<Payment> payments;

    // Konstruktor koji koristi DataInitializer
    public CandidateFinanceAccount(Integer id, User user, LocalDate enrollmentDate,
                                   BigDecimal progressPercentage, Integer assignedInstructorId,
                                   Integer ruleId, BigDecimal totalAmount, List<Payment> payments) {
        this.id                  = id;
        this.user                = user;
        this.enrollmentDate      = enrollmentDate;
        this.progressPercentage  = progressPercentage;
        this.assignedInstructorId = assignedInstructorId;
        this.ruleId              = ruleId;
        this.totalAmount         = totalAmount;
        this.payments            = payments;
        this.remainingDebt       = totalAmount; // na početku dug = ukupna cijena
    }
}