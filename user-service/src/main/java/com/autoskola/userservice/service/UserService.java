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

    public Page<UserDTO> searchUsersPaged(int page, int size, String sortBy, String role, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        String roleParam = (role == null || role.isBlank() || role.equalsIgnoreCase("ALL")) ? null : role;
        String searchParam = (search == null || search.isBlank()) ? null : search;
        Page<User> usersPage = userRepository.searchUsers(roleParam, searchParam, pageable);
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

        Announcement welcome = new Announcement();
        welcome.setTitle("Dobrodošlica");
        welcome.setContent("Dobrodošli u NWT Auto školu, " + savedUser.getFirstName() + "! Vaš nalog je uspješno kreiran.");
        welcome.setCreatedBy(savedUser.getUserId());
        welcome.setTargetUserId(savedUser.getUserId());
        announcementRepository.save(welcome);

        Announcement adminNote = new Announcement();
        adminNote.setTitle("Novi korisnik registrovan");
        adminNote.setContent("Korisnik " + savedUser.getFirstName() + " " + savedUser.getLastName() + " (" + savedUser.getEmail() + ") je dodat u sistem s ulogom " + savedUser.getRole() + ".");
        adminNote.setCreatedBy(savedUser.getUserId());
        adminNote.setTargetUserId(null);
        adminNote.setAdminOnly(true);
        announcementRepository.save(adminNote);

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
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        User savedUser = userRepository.save(user);

        Announcement adminNote = new Announcement();
        adminNote.setTitle("Novi korisnik dodan");
        adminNote.setContent("Korisnik " + savedUser.getFirstName() + " " + savedUser.getLastName()
                + " (" + savedUser.getEmail() + ") je dodat u sistem s ulogom " + savedUser.getRole() + ".");
        adminNote.setCreatedBy(null);
        adminNote.setTargetUserId(null);
        adminNote.setAdminOnly(true);
        announcementRepository.save(adminNote);

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

        if ("INSTRUKTOR".equals(user.getRole())) {
            Boolean imaCasove = trainingClient.hasActiveSessions(id);

            if (imaCasove) {
                throw new RuntimeException("Ne možete obrisati instruktora jer ima aktivne termine vožnje u training-servisu!");
            }
        }

        userRepository.deleteById(id);

        try {
            rabbitTemplate.convertAndSend("skola_exchange", "user.deleted", id);
            System.out.println("User Service: Poruka o brisanju poslana za ID: " + id);
        } catch (Exception e) {
            System.out.println("User Service: RabbitMQ nije dostupan, brisanje nastavljeno bez poruke: " + e.getMessage());
        }
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Korisnik sa emailom " + email + " nije pronađen"));
    }

    @EventListener(ApplicationReadyEvent.class)
    public void syncOnStartup() {
        try {
            publishAllExistingUsers();
        } catch (Exception e) {
            System.out.println("RabbitMQ nije dostupan pri startu, sync preskočen: " + e.getMessage());
        }
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