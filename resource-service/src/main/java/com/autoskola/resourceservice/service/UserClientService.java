package com.autoskola.resourceservice.service;

import com.autoskola.resourceservice.dto.UserDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class UserClientService {

    private final RestTemplate restTemplate;

    public UserClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public UserDTO getUserById(Long userId) {
        String url = "http://localhost:8081/users/" + userId;
        return restTemplate.getForObject(url, UserDTO.class);
    }
}