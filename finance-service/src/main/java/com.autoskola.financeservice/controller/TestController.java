package com.autoskola.financeservice.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Dijagnostički endpoint — samo za provjeru koja instanca odgovara.
 */
@RestController
@RequestMapping("/api/test")
public class TestController {

    @Value("${server.port}")
    private String port;

    @GetMapping("/info")
    public String getInfo() {
        return "Odgovor sa instance na portu: " + port;
    }
}
