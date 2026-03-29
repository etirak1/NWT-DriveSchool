package com.autoskola.userservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "announcements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long announcementId;

    private String title;
    private String content;
    private Long createdBy;
    private LocalDateTime dateCreated;
    private LocalDate expirationDate;

    @PrePersist
    protected void onCreate() {
        this.dateCreated = LocalDateTime.now();
    }
}