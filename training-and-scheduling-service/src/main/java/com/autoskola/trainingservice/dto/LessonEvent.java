package com.autoskola.trainingservice.dto;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonEvent {
    private Long lessonId;
    private Long candidateId;
    private String status;
}