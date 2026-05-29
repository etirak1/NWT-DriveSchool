package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity
@Table(name = "driving_lessons",
        uniqueConstraints = @UniqueConstraint(columnNames = {"candidate_id", "lesson_number"}))
public class DrivingLesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    @JsonIgnore
    private Candidate candidate;

    @Column(name = "lesson_number", nullable = false)
    private Integer lessonNumber;

    @Column(nullable = false)
    private LocalDate date;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private Boolean completed = false;

    public DrivingLesson() {}

    public DrivingLesson(Candidate candidate, Integer lessonNumber, LocalDate date, String notes) {
        this.candidate = candidate;
        this.lessonNumber = lessonNumber;
        this.date = date;
        this.notes = notes;
        this.completed = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Candidate getCandidate() { return candidate; }
    public void setCandidate(Candidate candidate) { this.candidate = candidate; }

    public Integer getLessonNumber() { return lessonNumber; }
    public void setLessonNumber(Integer lessonNumber) { this.lessonNumber = lessonNumber; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
}