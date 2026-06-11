package com.autoskola.trainingservice.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AddSessionRequest {
    private LocalDate date;
    private LocalTime startTime;
    private String topic;
    private Integer lessonFrom;
    private Integer lessonTo;
}
