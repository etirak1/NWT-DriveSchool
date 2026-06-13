package com.autoskola.userservice.controller;

import com.autoskola.userservice.dto.AnnouncementDTO;
import com.autoskola.userservice.model.Announcement;
import com.autoskola.userservice.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;


import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'CANDIDATE')")
    @GetMapping
    public List<AnnouncementDTO> getAll(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String role) {
        if ("ADMIN".equals(role)) {
            return announcementService.getAllAnnouncements();
        }
        if (userId != null) {
            return announcementService.getAnnouncementsForUser(userId);
        }
        return announcementService.getAllAnnouncements();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public AnnouncementDTO create(@Valid @RequestBody Announcement announcement) {
        return announcementService.createAnnouncement(announcement);
    }
}