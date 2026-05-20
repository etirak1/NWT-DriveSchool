package com.autoskola.trainingservice.client;

import com.autoskola.trainingservice.dto.UserDTO;
import com.autoskola.trainingservice.dto.UserPageResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/api/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);


    @GetMapping("/api/users")
    UserPageResponse getAllUsers();
}