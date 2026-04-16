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
    private final UserService userService;
    private final VehicleService vehicleService;

    public LessonService(LessonRepository lessonRepository,
                         UserService userService,
                         VehicleService vehicleService) {
        this.lessonRepository = lessonRepository;
        this.userService = userService;
        this.vehicleService = vehicleService;
    }

    public LessonWithUsersDTO getLessonDetails(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Čas nije pronađen"));


        UserDTO instructorUser = userService.getUserById(
                lesson.getInstructor().getUserId()
        );

        UserDTO candidateUser = userService.getUserById(
                lesson.getCandidate().getUserId()
        );


        VehicleDTO vehicle = vehicleService.getVehicleById(
                lesson.getVehicleId()
        );

        return new LessonWithUsersDTO(
                lesson,
                instructorUser,
                candidateUser,
                vehicle
        );
    }
}