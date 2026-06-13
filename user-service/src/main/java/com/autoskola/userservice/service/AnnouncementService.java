package com.autoskola.userservice.service;

import com.autoskola.userservice.dto.AnnouncementDTO;
import com.autoskola.userservice.model.Announcement;
import com.autoskola.userservice.repository.AnnouncementRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private ModelMapper modelMapper;

    public List<AnnouncementDTO> getAllAnnouncements() {
        return announcementRepository.findAll().stream()
                .map(ann -> modelMapper.map(ann, AnnouncementDTO.class))
                .collect(Collectors.toList());
    }

    public List<AnnouncementDTO> getAnnouncementsForUser(Long userId) {
        return announcementRepository.findVisibleForUser(userId).stream()
                .map(ann -> modelMapper.map(ann, AnnouncementDTO.class))
                .collect(Collectors.toList());
    }

    public AnnouncementDTO createAnnouncement(Announcement announcement) {
        Announcement saved = announcementRepository.save(announcement);
        return modelMapper.map(saved, AnnouncementDTO.class);
    }
}