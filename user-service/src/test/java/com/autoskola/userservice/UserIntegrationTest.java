package com.autoskola.userservice;

import com.autoskola.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = UserServiceApplication.class)
public class UserIntegrationTest {

    private MockMvc mvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository repository;

    @BeforeEach
    public void setup() {
        this.mvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    public void testCreateUserIntegration() throws Exception {
        String userJson = "{\"firstName\":\"Test\", \"lastName\":\"Integracija\", \"email\":\"test.int@email.com\", \"passwordHash\":\"123456\", \"role\":\"STUDENT\", \"status\":\"ACTIVE\"}";

        mvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isOk());

        boolean exists = repository.findAll().stream()
                .anyMatch(u -> u.getEmail().equals("test.int@email.com"));

        assertTrue(exists, "Korisnik bi trebao biti u bazi podataka!");
    }
}