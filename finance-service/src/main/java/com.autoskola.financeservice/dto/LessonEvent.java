package com.autoskola.financeservice.dto;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonEvent {
    private Long lessonId;
    private Long candidateId;
    private String status;
    private String sagaId;  // Idempotency key
}
