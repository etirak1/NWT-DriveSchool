package com.autoskola.resourceservice.service;

import com.autoskola.resourceservice.dto.UserDTO;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserClientServiceTest {

    @Test
    void shouldCallUserServiceAndReturnUser() {

        RestTemplate restTemplate = mock(RestTemplate.class);
        UserClientService service = new UserClientService(restTemplate);

        UserDTO dto = new UserDTO(1L, "Test", "User", "test@mail.com", "INSTRUCTOR", "ACTIVE");

        when(restTemplate.getForObject(anyString(), eq(UserDTO.class)))
                .thenReturn(dto);

        UserDTO result = service.getUserById(1L);

        assertNotNull(result);
        assertEquals("Test", result.getFirstName());
    }
}