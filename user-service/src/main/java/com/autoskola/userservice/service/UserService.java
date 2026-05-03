package com.autoskola.userservice.service;

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
        User savedUser = userRepository.save(user);

        Announcement note = new Announcement();
        note.setTitle("Dobrodošlica");
        note.setContent("Novi korisnik " + savedUser.getFirstName() + " je dodat u sistem.");
        note.setCreatedBy(savedUser.getUserId());
        announcementRepository.save(note);

        return modelMapper.map(savedUser, UserDTO.class);
    }

    public UserDTO createUser(User user) {
        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDTO.class);
    }
}