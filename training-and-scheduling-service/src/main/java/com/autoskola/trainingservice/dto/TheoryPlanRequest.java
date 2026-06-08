package com.autoskola.trainingservice.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TheoryPlanRequest {

    private String groupName;
    private List<Long> candidateIds;
    private LocalDate startDate;
    private String day1OfWeek;
    private String day2OfWeek;
    private LocalTime startTime;
    private Integer durationMinutes;
    private Integer totalLessons;
    private Integer lessonsPerSession;
}