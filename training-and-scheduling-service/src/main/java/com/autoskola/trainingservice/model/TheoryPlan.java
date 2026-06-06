package com.autoskola.trainingservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "theory_plans")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TheoryPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String groupName;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private String day1OfWeek; // npr. "TUESDAY"

    @Column(nullable = false)
    private String day2OfWeek; // npr. "THURSDAY"

    @Column(nullable = false)
    private LocalTime startTime;

    private Integer durationMinutes = 45;
    private Integer totalLessons = 40;
    private Integer lessonsPerSession = 3;

    @JsonIgnore
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TheorySession> sessions = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "theory_plan_candidates",
            joinColumns = @JoinColumn(name = "plan_id"),
            inverseJoinColumns = @JoinColumn(name = "candidate_id")
    )
    private List<Candidate> candidates = new ArrayList<>();
}