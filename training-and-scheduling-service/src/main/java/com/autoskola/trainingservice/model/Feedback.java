package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "feedbacks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    @NotNull(message = "Kandidat je obavezan")
    @ManyToOne
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;

    @NotNull(message = "Instruktor je obavezan")
    @ManyToOne
    @JoinColumn(name = "instructor_id")
    private Instructor instructor;

    @Min(value = 1, message = "Minimalna ocjena je 1")
    @Max(value = 5, message = "Maksimalna ocjena je 5")
    private Integer rating;

    @Size(max = 500, message = "Komentar može imati najviše 500 karaktera")
    private String comment;

    @PastOrPresent(message = "Datum kreiranja ne može biti u budućnosti")
    private LocalDate dateCreated;
}
