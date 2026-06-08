package com.autoskola.trainingservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "theory_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TheorySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private TheoryPlan plan;

    @Column(nullable = false)
    private Integer sessionNumber;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime startTime;

    private Integer durationMinutes;

    @Column(nullable = false)
    private Integer lessonFrom;

    @Column(nullable = false)
    private Integer lessonTo;

    private String topic;

    @Column(nullable = false)
    private String status = "PLANIRANO"; // PLANIRANO, ODRŽANO, OTKAZANO

    private String note;
}