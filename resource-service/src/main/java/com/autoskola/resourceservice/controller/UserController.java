package com.autoskola.resourceservice.controller;

import com.autoskola.resourceservice.model.User;
import com.autoskola.resourceservice.event.ResourceEventPublisher;
import com.autoskola.resourceservice.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final ResourceEventPublisher eventPublisher;

    public UserController(UserRepository userRepository,
                          ResourceEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public User createUser(@Valid @RequestBody User user) {
        User saved = userRepository.save(user);
        eventPublisher.publishUserCreated(saved);
        return saved;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public User updateUser(@PathVariable Long id, @Valid @RequestBody User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));

        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        user.setEmail(updatedUser.getEmail());
        user.setPasswordHash(updatedUser.getPasswordHash());
        user.setRole(updatedUser.getRole());
        user.setStatus(updatedUser.getStatus());

        User saved = userRepository.save(user);
        eventPublisher.publishUserUpdated(saved);
        return saved;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        eventPublisher.publishUserDeleted(id);
    }
}