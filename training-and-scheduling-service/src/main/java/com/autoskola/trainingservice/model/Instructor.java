package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "instructors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Instructor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long instructorId;

    private Long userId; // povezan sa User

    private String availabilityNote; // npr. “Available Mon-Fri 9-17”

    private LocalDateTime dateCreated;

    @PrePersist
    protected void onCreate() {
        dateCreated = LocalDateTime.now();
    }
}