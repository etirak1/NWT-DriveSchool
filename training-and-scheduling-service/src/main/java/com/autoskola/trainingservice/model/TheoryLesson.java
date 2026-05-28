package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "theory_lessons",
       uniqueConstraints = @UniqueConstraint(columnNames = {"candidate_id", "lesson_number"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TheoryLesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(name = "lesson_number", nullable = false)
    private Integer lessonNumber; // 1–40

    @Column(nullable = false)
    private boolean completed = false;

    private LocalDate completedDate;
}
