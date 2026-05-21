package com.autoskola.userservice.controller;

import com.autoskola.userservice.dto.UserDTO;
import com.autoskola.userservice.model.User;
import com.autoskola.userservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;


import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;


@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "userId") String sortBy) {
        return ResponseEntity.ok(userService.getAllUsersPaged(page, size, sortBy));
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @GetMapping("/active")
    public List<UserDTO> getActiveByRole(@RequestParam String role) {
        return userService.getActiveUsers(role);
    }


    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerWithWelcome(@Valid @RequestBody User user) {
        return ResponseEntity.ok(userService.registerNewUserWithWelcomeNote(user));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(path = "/{id}", consumes = "application/json-patch+json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserDTO> patchUser(@PathVariable Long id, @RequestBody JsonPatch patch) {
        try {
            return ResponseEntity.ok(userService.patchUser(id, patch));
        } catch (JsonPatchException | JsonProcessingException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteOrDeactivateInstructor(id);
            return ResponseEntity.ok("Korisnik uspješno obrisan.");
        } catch (RuntimeException e) {
            // Ovdje upada poruka iz UserService:
            // "Ne možete obrisati instruktora jer ima aktivne termine vožnje..."
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        }
    }
}