package com.autoskola.userservice.controller;

import com.autoskola.userservice.dto.AnnouncementDTO;
import com.autoskola.userservice.model.Announcement;
import com.autoskola.userservice.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    @GetMapping
    public List<AnnouncementDTO> getAll() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            boolean isAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (isAdmin) {
                return announcementService.getAllAnnouncements();
            }

            if (auth != null && auth.getDetails() instanceof Long userId) {
                return announcementService.getAnnouncementsForUser(userId);
            }

            return announcementService.getAllAnnouncements();

        } catch (Exception e) {
            return announcementService.getAllAnnouncements();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public AnnouncementDTO create(@Valid @RequestBody Announcement announcement) {
        return announcementService.createAnnouncement(announcement);
    }
}
