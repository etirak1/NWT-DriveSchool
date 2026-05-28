package com.autoskola.resourceservice.service;

import com.autoskola.resourceservice.config.RabbitMQConfig;
import com.autoskola.resourceservice.dto.InstructorDTO;
import com.autoskola.resourceservice.dto.UserDTO;
import com.autoskola.resourceservice.event.InstructorVehicleAssignedEvent;
import com.autoskola.resourceservice.exception.ResourceNotFoundException;
import com.autoskola.resourceservice.model.Instructor;
import com.autoskola.resourceservice.model.Vehicle;
import com.autoskola.resourceservice.repository.InstructorRepository;
import com.autoskola.resourceservice.repository.UserRepository;
import com.autoskola.resourceservice.repository.VehicleRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InstructorService {

    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final RabbitTemplate rabbitTemplate;

    public InstructorService(InstructorRepository instructorRepository,
                             UserRepository userRepository, VehicleRepository vehicleRepository,
                             RabbitTemplate rabbitTemplate) {
        this.instructorRepository = instructorRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    public InstructorDTO getInstructorFullDetails(Long id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instruktor nije pronađen"));

        UserDTO userDTO = userRepository.findById(instructor.getUserId())
                .map(user -> new UserDTO(user.getUserId(), user.getFirstName(),
                        user.getLastName(), user.getEmail(), user.getRole()))
                .orElse(new UserDTO(instructor.getUserId(), "N/A", "N/A", "N/A", "INSTRUCTOR"));

        return new InstructorDTO(instructor.getInstructorId(), userDTO, instructor.getAvailabilityNote());
    }

    public List<InstructorDTO> getAllInstructors() {
        return instructorRepository.findAll().stream()
                .map(inst -> {
                    UserDTO userDTO = userRepository.findById(inst.getUserId())
                            .map(user -> new UserDTO(user.getUserId(), user.getFirstName(),
                                    user.getLastName(), user.getEmail(), user.getRole()))
                            .orElse(new UserDTO(inst.getUserId(), "N/A", "N/A", "N/A", "INSTRUCTOR"));
                    return new InstructorDTO(inst.getInstructorId(), userDTO, inst.getAvailabilityNote());
                })
                .collect(Collectors.toList());
    }

    public InstructorDTO createInstructor(Instructor instructor) {
        userRepository.findById(instructor.getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "Korisnik sa ID-om " + instructor.getUserId() + " ne postoji."));
        Instructor saved = instructorRepository.save(instructor);
        return getInstructorFullDetails(saved.getInstructorId());
    }

    public Instructor getById(Long id) {
        return instructorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instruktor nije pronađen"));
    }

    public List<Instructor> getAll() {
        return instructorRepository.findAll();
    }

    public InstructorDTO updateAvailability(Long id, String note) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instruktor nije pronađen"));
        instructor.setAvailabilityNote(note);
        instructorRepository.save(instructor);
        return getInstructorFullDetails(id);
    }


    @Transactional
    public InstructorDTO assignVehicleToInstructor(Long instructorId, Long vehicleId) {
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instruktor nije pronađen"));

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vozilo nije pronađeno"));

        instructorRepository.findAll().stream()
                .filter(i -> !i.getInstructorId().equals(instructorId))
                .filter(i -> vehicleId.equals(i.getAssignedVehicleId()))
                .findFirst()
                .ifPresent(i -> {
                    throw new RuntimeException(
                            "Vozilo je već dodijeljeno drugom instruktoru (ID " + i.getInstructorId() + ").");
                });

        instructor.setAssignedVehicleId(vehicleId);
        instructorRepository.save(instructor);

        InstructorVehicleAssignedEvent event = new InstructorVehicleAssignedEvent(
                instructor.getInstructorId(),
                instructor.getUserId(),
                vehicle.getVehicleId(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getRegistrationNumber(),
                vehicle.getStatus()
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                "instructor.vehicle.assigned",
                event
        );

        return getInstructorFullDetails(instructorId);
    }
}