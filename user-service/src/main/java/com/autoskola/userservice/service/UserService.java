package com.autoskola.userservice.service;

import com.autoskola.userservice.client.TrainingClient;
import com.autoskola.userservice.dto.UserDTO;
import com.autoskola.userservice.model.Announcement;
import com.autoskola.userservice.model.User;
import com.autoskola.userservice.repository.AnnouncementRepository;
import com.autoskola.userservice.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
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
        note.setContent("Novi korisnik " + savedUser.getFirstName() + " je dodat u sistem.");
        note.setCreatedBy(savedUser.getUserId());
        announcementRepository.save(note);

        return modelMapper.map(savedUser, UserDTO.class);
    }

    public UserDTO createUser(User user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));  // <-- novo
        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDTO.class);
    }

    public void deleteOrDeactivateInstructor(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Korisnik nije pronadjen"));

        if ("INSTRUKTOR".equals(user.getRole())) {

            // SINHRONI POZIV: Čekamo odgovor od training-service
            // Ovo je tačka 1.a iz zadatka - Validacija podataka kao međukorak
            Boolean imaCasove = trainingClient.hasActiveSessions(id);

            if (imaCasove) {
                throw new RuntimeException("Ne možete obrisati instruktora jer ima aktivne termine vožnje u training-servisu!");
            }
        }

        // Ako nema časova ili nije instruktor, brišemo ga
        userRepository.deleteById(id);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Korisnik sa emailom " + email + " nije pronađen"));
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Korisnik sa id " + id + " nije pronadjen"));
        return modelMapper.map(user, UserDTO.class);
    }

}