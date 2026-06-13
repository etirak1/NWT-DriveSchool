package com.autoskola.userservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;


@Entity
@Table(name = "announcements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long announcementId;

    @NotBlank(message = "Naslov obavještenja je obavezan")
    private String title;
    private String content;
    private Long createdBy;
    private Long targetUserId;
    private boolean adminOnly = false;
    private LocalDateTime dateCreated;
    private LocalDate expirationDate;

    @PrePersist
    protected void onCreate() {
        this.dateCreated = LocalDateTime.now();
    }
}