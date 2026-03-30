package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.LessonWithUsersDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.dto.VehicleDTO;
import com.autoskola.trainingservice.model.Lesson;
import com.autoskola.trainingservice.repository.LessonRepository;
import org.springframework.stereotype.Service;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final UserClientService userClientService;

    public LessonService(LessonRepository lessonRepository, UserClientService userClientService) {
        this.lessonRepository = lessonRepository;
        this.userClientService = userClientService;
    }

    public LessonWithUsersDTO getLessonDetails(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));


        UserDTO instructorUser = userClientService.getUserById(lesson.getInstructor().getUserId());
        UserDTO candidateUser = userClientService.getUserById(lesson.getCandidate().getUserId());


        VehicleDTO vehicle = userClientService.getVehicleById(lesson.getVehicleId());


        return new LessonWithUsersDTO(lesson, instructorUser, candidateUser, vehicle);
    }
}