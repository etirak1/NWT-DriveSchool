package com.autoskola.trainingservice.dto;

import com.autoskola.trainingservice.model.Lesson;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonDTO {

    private Long lessonId;

    @NotNull(message = "Vozilo je obavezno")
    private Long vehicleId;

    @NotNull(message = "Datum i vrijeme časa su obavezni")
    @Future(message = "Čas se mora zakazati za budući termin")
    private LocalDateTime dateTime;

    @Min(value = 30, message = "Trajanje časa ne može biti kraće od 30 minuta")
    @Max(value = 120, message = "Trajanje časa ne može biti duže od 120 minuta")
    private Integer duration;

    @NotBlank(message = "Status časa je obavezan")
    @Pattern(
            regexp = "^(ZAKAZANO|ODRAĐENO|OTKAZANO)$",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "Status časa mora biti: ZAKAZANO, ODRAĐENO ili OTKAZANO"
    )
    private String status;
    private String notes;

    private UserDTO instructor;
    private UserDTO candidate;

    private String lessonType;
    private String topic;

    public LessonDTO(Lesson lesson, UserDTO instructor, UserDTO candidate) {
        this.lessonId = lesson.getLessonId();
        this.dateTime = lesson.getDateTime();
        this.duration = lesson.getDuration();
        this.status = lesson.getStatus();
        this.notes = lesson.getNotes();
        this.vehicleId = lesson.getVehicleId();
        this.instructor = instructor;
        this.candidate = candidate;
        this.lessonType = lesson.getLessonType();
        this.topic = lesson.getTopic();
    }
}