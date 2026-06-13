package com.autoskola.userservice.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AnnouncementDTO {
    private Long id;
    private String title;
    private String content;
    private Long createdBy;
    private LocalDateTime dateCreated;
    private LocalDate expirationDate;
    private Long targetUserId;
}