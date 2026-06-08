package com.autoskola.trainingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhaseStatusDTO {
    private String key;
    private String label;
    private String status;
    private String progress;
    private Long phaseId;
    private String examStatus;
    private LocalDate examDate;
    private String notes;
}
