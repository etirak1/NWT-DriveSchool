package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.InstructorDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Feedback;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.model.User;
import com.autoskola.trainingservice.repository.FeedbackRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
import com.autoskola.trainingservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InstructorService {

    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;

    public InstructorService(InstructorRepository instructorRepository,
                             UserRepository userRepository, FeedbackRepository feedbackRepository) {
        this.instructorRepository = instructorRepository;
        this.userRepository = userRepository;
        this.feedbackRepository = feedbackRepository;
    }

    public InstructorDTO getInstructorFullDetails(Long id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        User user = userRepository.findById(instructor.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO userDTO = new UserDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );

        return new InstructorDTO(instructor.getInstructorId(), userDTO);
    }

    public InstructorDTO createInstructor(Instructor instructor) {

        userRepository.findById(instructor.getUserId())
                .orElseThrow(() -> new RuntimeException("Korisnik sa ID-om " + instructor.getUserId() + " ne postoji."));
        Instructor saved = instructorRepository.save(instructor);

        return getInstructorFullDetails(saved.getInstructorId());
    }

    public List<InstructorDTO> getAllInstructors() {
        return instructorRepository.findAll().stream()
                .map(inst -> {
                    User user = userRepository.findById(inst.getUserId())
                            .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));

                    UserDTO userDTO = new UserDTO(
                            user.getUserId(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getRole()
                    );

                    return new InstructorDTO(inst.getInstructorId(), userDTO);
                })
                .collect(Collectors.toList());
    }

    @Value("${server.port}")
    private String port;

    public List<Map<String, Object>> getInstructorPerformanceReport() {
        List<Instructor> instructors = instructorRepository.findAll();
        List<Map<String, Object>> report = new ArrayList<>();

        for (Instructor inst : instructors) {
            List<Feedback> feedbacks = feedbackRepository.findByInstructorInstructorId(inst.getInstructorId());

            double average = feedbacks.stream()
                    .mapToInt(Feedback::getRating)
                    .average()
                    .orElse(0.0);

            Map<String, Object> instData = new HashMap<>();
            instData.put("instructorId", inst.getInstructorId());
            instData.put("averageRating", String.format("%.2f", average));
            instData.put("totalReviews", feedbacks.size());

            report.add(instData);
        }
        return report;
    }

}