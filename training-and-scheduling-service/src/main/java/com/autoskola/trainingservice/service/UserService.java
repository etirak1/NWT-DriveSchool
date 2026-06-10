package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.model.User;
import com.autoskola.trainingservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserDTO(user.getUserId(), user.getFirstName(), user.getLastName(), user.getRole()))
                .collect(Collectors.toList());
    }

    public UserDTO createUser(User user) {
        User saved = userRepository.save(user);
        return new UserDTO(saved.getUserId(), saved.getFirstName(), saved.getLastName(), saved.getRole());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));
        return new UserDTO(user.getUserId(), user.getFirstName(), user.getLastName(), user.getRole());
    }
}
