package com.autoskola.resourceservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @GetMapping("/whoami")
    public String whoami(HttpServletRequest request) {
        return "Resource Service instance on port: " + request.getLocalPort();
    }
}
