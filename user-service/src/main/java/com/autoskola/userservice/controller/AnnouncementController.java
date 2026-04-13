package com.autoskola.userservice.controller;

import com.autoskola.userservice.dto.AnnouncementDTO;
import com.autoskola.userservice.model.Announcement;
import com.autoskola.userservice.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @GetMapping
    public List<AnnouncementDTO> getAll() {
        return announcementService.getAllAnnouncements();
    }

    @PostMapping
    public AnnouncementDTO create(@RequestBody Announcement announcement) {
        return announcementService.createAnnouncement(announcement);
    }
}