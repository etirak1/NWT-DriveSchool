package com.autoskola.trainingservice.dto;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonEvent {
    private UUID sagaId;
    private Long lessonId;
    private Long candidateId;
    private String status;
}