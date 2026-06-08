package com.autoskola.userservice.controller;

import com.autoskola.userservice.dto.UserDTO;
import com.autoskola.userservice.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Interni endpoint za inter-service komunikaciju — bez JWT autentifikacije.
 * Pristupačan samo sa localhost (servis-na-servis).
 */
@RestController
@RequestMapping("/internal")
public class InternalController {

    private final UserService userService;

    public InternalController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/instructors")
    public List<UserDTO> getInstructors() {
        return userService.getActiveUsers("INSTRUCTOR");
    }
}
