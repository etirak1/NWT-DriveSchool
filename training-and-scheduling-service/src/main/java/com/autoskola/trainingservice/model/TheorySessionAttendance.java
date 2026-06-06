package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "theory_session_attendance",
        uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "candidate_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TheorySessionAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private TheorySession session;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    private boolean present = false;

    private String note;
}