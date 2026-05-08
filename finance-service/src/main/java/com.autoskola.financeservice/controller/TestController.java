package com.autoskola.financeservice.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Value("${server.port}")
    private String port;

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/info")
    public String getInfo() {
        return "Odgovor sa instance na portu: " + port;
    }


    @GetMapping("/lb-test")
    public String loadBalancerTest() {
        String url = "http://finance-service/api/test/info";
        return restTemplate.getForObject(url, String.class);
    }
}