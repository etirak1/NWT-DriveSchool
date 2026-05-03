package com.autoskola.trainingservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "instructors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Instructor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long instructorId;

    @NotNull(message = "User ID je obavezan")
    private Long userId;


}