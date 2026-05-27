package com.autoskola.financeservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*; // DODANO
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
    @Column(name = "candidate_id")
    private Integer id;

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

    @OneToMany(mappedBy = "candidateAccount")
    @JsonIgnore // Ovo sprečava da se uplate ponovo učitavaju unutar accounta
    private List<Payment> payments;
}

