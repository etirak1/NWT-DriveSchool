package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.Feedback;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDTO {

    private Long feedbackId;

    @Min(value = 1, message = "Minimalna ocjena je 1")
    @Max(value = 5, message = "Maksimalna ocjena je 5")
    private Integer rating;

    @NotBlank(message = "Komentar ne može biti prazan")
    @Size(max = 500, message = "Komentar može imati najviše 500 karaktera")
    private String comment;

    @PastOrPresent(message = "Datum kreiranja ne može biti u budućnosti")
    private LocalDate dateCreated;

    private CandidateDTO candidate;
    private InstructorDTO instructor;

}