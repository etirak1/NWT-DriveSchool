package com.autoskola.resourceservice.service;

import com.autoskola.resourceservice.dto.UserDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

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

    public List<UserDTO> getAllInstructors() {
        try {
            String url = "http://localhost:8081/internal/users/instructors";
            ResponseEntity<List<UserDTO>> response = restTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<UserDTO>>() {});
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            System.err.println("Nije moguće sinhronizovati instruktore sa user-service: " + e.getMessage());
            return Collections.emptyList();
        }
    }
}