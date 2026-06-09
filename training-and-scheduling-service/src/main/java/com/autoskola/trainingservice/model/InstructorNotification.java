package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "instructor_notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InstructorNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long instructorUserId;

    private String type;
    private String title;
    private String body;

    @Column(name = "is_read")
    private boolean read = false;

    private LocalDateTime timestamp = LocalDateTime.now();
}
