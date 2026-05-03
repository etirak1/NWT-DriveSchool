package com.autoskola.userservice;

import com.autoskola.userservice.repository.AnnouncementRepository;
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
public class AnnouncementIntegrationTest {

    private MockMvc mvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @BeforeEach
    public void setup() {
        this.mvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    public void testCreateAnnouncementIntegration() throws Exception {
        String announcementJson = "{\"title\":\"Test Obavijest\", \"content\":\"Sadržaj testne obavijesti\", \"createdBy\":1}";

        mvc.perform(post("/api/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(announcementJson))
                .andExpect(status().isOk());

        boolean exists = announcementRepository.findAll().stream()
                .anyMatch(a -> a.getTitle().equals("Test Obavijest"));

        assertTrue(exists, "Obaveštenje bi trebalo biti uspješno sačuvano u bazi!");
    }

    @Test
    public void testCreateAnnouncement_ValidationFail() throws Exception {
        String invalidJson = "{\"title\":\"\", \"content\":\"Nema naslova\", \"createdBy\":1}";

        mvc.perform(post("/api/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }
}