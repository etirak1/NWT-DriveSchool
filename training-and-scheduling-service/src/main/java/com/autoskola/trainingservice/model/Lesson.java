package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lessons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lessonId;

    @NotNull(message = "Kandidat je obavezan")
    @ManyToOne
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;

    @ManyToOne
    @JoinColumn(name = "instructor_id")
    private Instructor instructor;

    private Long vehicleId;

    @NotNull(message = "Datum i vrijeme časa su obavezni")
    @Future(message = "Čas se mora zakazati za budući termin")
    private LocalDateTime dateTime;

    @Min(value = 30, message = "Trajanje časa ne može biti kraće od 30 minuta")
    @Max(value = 120, message = "Trajanje časa ne može biti duže od 120 minuta")
    private Integer duration;

    @NotBlank(message = "Status časa je obavezan")
    @Pattern(
            regexp = "^(ZAKAZANO|ODRAĐENO|OTKAZANO|PENDING)$",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "Status časa mora biti: ZAKAZANO, ODRAĐENO, OTKAZANO ILI PENDING"
    )
    private String status;
    private String notes;



}
