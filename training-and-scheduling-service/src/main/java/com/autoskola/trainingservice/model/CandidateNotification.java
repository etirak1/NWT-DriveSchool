package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CandidateNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long candidateUserId;

    private String type;
    private String title;
    private String body;

    @Column(name = "is_read")
    private boolean read = false;

    private LocalDateTime timestamp = LocalDateTime.now();
}
