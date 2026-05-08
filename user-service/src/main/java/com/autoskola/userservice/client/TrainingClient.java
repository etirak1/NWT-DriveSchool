package com.autoskola.userservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "training-service")

public interface TrainingClient {

    @GetMapping("/api/lessons/instructor/{id}/has-active-sessions")
    Boolean hasActiveSessions(@PathVariable("id") Long userId);
}