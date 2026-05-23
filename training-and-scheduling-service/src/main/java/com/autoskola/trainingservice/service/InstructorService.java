package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.client.UserClient;
import com.autoskola.trainingservice.dto.InstructorDTO;
import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.Feedback;
import com.autoskola.trainingservice.model.Instructor;
import com.autoskola.trainingservice.repository.FeedbackRepository;
import com.autoskola.trainingservice.repository.InstructorRepository;
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
    private final UserClient userClient;
    private final FeedbackRepository feedbackRepository;

    public InstructorService(InstructorRepository instructorRepository,
                             UserClient userClient,
                             FeedbackRepository feedbackRepository) {
        this.instructorRepository = instructorRepository;
        this.userClient = userClient;
        this.feedbackRepository = feedbackRepository;
    }

    public InstructorDTO getInstructorFullDetails(Long id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        UserDTO userDTO;
        try {
            userDTO = userClient.getUserById(instructor.getUserId());
        } catch (Exception e) {
            userDTO = new UserDTO(instructor.getUserId(), "Nepoznato", "Korisnik", "INSTRUCTOR");
        }

        return new InstructorDTO(instructor.getInstructorId(), userDTO);
    }

    public InstructorDTO createInstructor(Instructor instructor) {
        try {
            userClient.getUserById(instructor.getUserId());
        } catch (Exception e) {
            throw new RuntimeException("Korisnik sa ID-om " + instructor.getUserId() + " ne postoji.");
        }
        Instructor saved = instructorRepository.save(instructor);
        return getInstructorFullDetails(saved.getInstructorId());
    }

    public List<InstructorDTO> getAllInstructors() {
        return instructorRepository.findAll().stream()
                .map(inst -> {
                    UserDTO userDTO;
                    try {
                        userDTO = userClient.getUserById(inst.getUserId());
                    } catch (Exception e) {
                        userDTO = new UserDTO(inst.getUserId(), "Nepoznato", "Korisnik", "INSTRUCTOR");
                    }
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