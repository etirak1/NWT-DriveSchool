package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.dto.VehicleDTO;
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

    public VehicleDTO getVehicleById(Long vehicleId) {

        String url = "http://localhost:8082/api/vehicles/" + vehicleId;
        try {
            return restTemplate.getForObject(url, VehicleDTO.class);
        } catch (Exception e) {
            return null;
        }
    }
}