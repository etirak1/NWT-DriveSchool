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
    private String day1OfWeek;  // npr. "TUESDAY"
    private String day2OfWeek;  // npr. "THURSDAY"
    private LocalTime startTime;
    private Integer durationMinutes;    // default 45
    private Integer totalLessons;       // default 40
    private Integer lessonsPerSession;  // default 3
}