package com.autoskola.userservice.service;

import com.autoskola.userservice.client.TrainingClient;
import com.autoskola.userservice.dto.UserDTO;
import com.autoskola.userservice.event.UserRegisteredEvent;
import com.autoskola.userservice.model.Announcement;
import com.autoskola.userservice.model.User;
import com.autoskola.userservice.repository.AnnouncementRepository;
import com.autoskola.userservice.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TrainingClient trainingClient;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public Page<UserDTO> getAllUsersPaged(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<User> usersPage = userRepository.findAll(pageable);
        return usersPage.map(user -> modelMapper.map(user, UserDTO.class));
    }

    public List<UserDTO> getActiveUsers(String role) {
        return userRepository.findActiveByRole(role).stream()
                .map(u -> modelMapper.map(u, UserDTO.class))
                .collect(Collectors.toList());
    }

    public UserDTO patchUser(Long id, JsonPatch patch) throws JsonPatchException, JsonProcessingException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Korisnik sa id " + id + " nije pronadjen"));

        JsonNode userNode = objectMapper.convertValue(user, JsonNode.class);
        JsonNode patchedNode = patch.apply(userNode);
        User patchedUser = objectMapper.treeToValue(patchedNode, User.class);
        patchedUser.setUserId(id);

        User saved = userRepository.save(patchedUser);
        return modelMapper.map(saved, UserDTO.class);
    }

    @Transactional
    public UserDTO registerNewUserWithWelcomeNote(User user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        User savedUser = userRepository.save(user);

        Announcement note = new Announcement();
        note.setTitle("Dobrodošlica");
        note.setContent("Dobrodošli, " + savedUser.getFirstName() + "! Vaš nalog je uspješno kreiran. Možete pratiti napredak obuke, finansije i obavještenja putem ove platforme.");
        note.setCreatedBy(savedUser.getUserId());
        note.setTargetUserId(savedUser.getUserId());
        announcementRepository.save(note);

        UserRegisteredEvent event = new UserRegisteredEvent(
                savedUser.getUserId(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
        rabbitTemplate.convertAndSend("skola_exchange", "user.registered", event);

        return modelMapper.map(savedUser, UserDTO.class);
    }


    public UserDTO createUser(User user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));  // <-- novo
        User savedUser = userRepository.save(user);
        UserRegisteredEvent event = new UserRegisteredEvent(
                savedUser.getUserId(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
        rabbitTemplate.convertAndSend("skola_exchange", "user.registered", event);
        return modelMapper.map(savedUser, UserDTO.class);
    }

    public void deleteOrDeactivateInstructor(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Korisnik nije pronadjen"));

        if ("INSTRUKTOR".equals(user.getRole())) { // Prilagodi polje role tvojoj bazi

            Boolean imaCasove = trainingClient.hasActiveSessions(id);

            if (imaCasove) {
                throw new RuntimeException("Ne možete obrisati instruktora jer ima aktivne termine vožnje u training-servisu!");
            }
        }

        userRepository.deleteById(id);
        rabbitTemplate.convertAndSend("skola_exchange", "user.deleted", id);

        System.out.println("User Service: Poruka o brisanju poslana za ID: " + id);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Korisnik sa emailom " + email + " nije pronađen"));
    }

    @EventListener(ApplicationReadyEvent.class)
    public void syncOnStartup() {
        publishAllExistingUsers();
    }

    public void publishAllExistingUsers() {
        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            UserRegisteredEvent event = new UserRegisteredEvent(
                    u.getUserId(), u.getFirstName(), u.getLastName(), u.getEmail(), u.getRole()
            );
            rabbitTemplate.convertAndSend("skola_exchange", "user.registered", event);
        }
        System.out.println("Sync završen, poslano " + allUsers.size() + " eventa.");
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Korisnik sa id " + id + " nije pronađen"));
        return modelMapper.map(user, UserDTO.class);
    }


}