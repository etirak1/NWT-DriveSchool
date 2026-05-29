package com.autoskola.trainingservice.dto;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonEvent {
    private Long lessonId;
    private Long candidateId;
    private String status;
    private String sagaId;  // Idempotency key — spriječava dupliranu obradu

    public LessonEvent(Long lessonId, Long candidateId, String status) {
        this.lessonId = lessonId;
        this.candidateId = candidateId;
        this.status = status;
        this.sagaId = UUID.randomUUID().toString();
    }
}