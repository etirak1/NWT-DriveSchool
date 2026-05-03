package com.autoskola.userservice;

import com.autoskola.userservice.controller.UserController;
import com.autoskola.userservice.dto.UserDTO;
import com.autoskola.userservice.service.UserService;
import com.github.fge.jsonpatch.JsonPatchException;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.autoskola.userservice.repository.UserRepository;
import com.autoskola.userservice.repository.AnnouncementRepository;

@WebMvcTest(UserController.class)

@ActiveProfiles("test")
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private AnnouncementRepository announcementRepository;


    @Test
    public void testGetAllUsers_Success() throws Exception {
        UserDTO dto = new UserDTO();
        dto.setFirstName("Elma");

        when(userService.getAllUsersPaged(anyInt(), anyInt(), anyString()))
                .thenReturn(new PageImpl<>(Collections.singletonList(dto)));

        mockMvc.perform(get("/api/users?page=0&size=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].firstName").value("Elma"));
    }

    @Test
    public void testGetActiveByRole_Success() throws Exception {
        UserDTO dto = new UserDTO();
        dto.setRole("ADMIN");

        when(userService.getActiveUsers("ADMIN"))
                .thenReturn(Collections.singletonList(dto));

        mockMvc.perform(get("/api/users/active?role=ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].role").value("ADMIN"));
    }

    @Test
    public void testRegister_Success() throws Exception {
        UserDTO dto = new UserDTO();
        dto.setEmail("test@etf.ba");

        when(userService.registerNewUserWithWelcomeNote(any())).thenReturn(dto);

        String validUserJson = "{\"firstName\":\"Test\", \"lastName\":\"Test\", \"email\":\"test@etf.ba\", \"passwordHash\":\"123456\", \"role\":\"STUDENT\", \"status\":\"ACTIVE\"}";

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validUserJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@etf.ba"));
    }


    @Test
    public void testPatchUser_Success() throws Exception {
        UserDTO updated = new UserDTO();
        updated.setUserId(1L);
        updated.setFirstName("Ana");
        updated.setStatus("INACTIVE");

        when(userService.patchUser(eq(1L), any())).thenReturn(updated);

        String patchBody = "[{\"op\":\"replace\",\"path\":\"/firstName\",\"value\":\"Ana\"}," +
                "{\"op\":\"replace\",\"path\":\"/status\",\"value\":\"INACTIVE\"}]";

        mockMvc.perform(patch("/api/users/1")
                        .contentType("application/json-patch+json")
                        .content(patchBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Ana"))
                .andExpect(jsonPath("$.status").value("INACTIVE"));
    }

    @Test
    public void testPatchUser_NotFound() throws Exception {
        when(userService.patchUser(eq(999L), any()))
                .thenThrow(new EntityNotFoundException("Korisnik sa id 999 nije pronađen"));

        String patchBody = "[{\"op\":\"replace\",\"path\":\"/firstName\",\"value\":\"Ana\"}]";

        mockMvc.perform(patch("/api/users/999")
                        .contentType("application/json-patch+json")
                        .content(patchBody))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testPatchUser_InvalidPatch() throws Exception {
        when(userService.patchUser(eq(1L), any()))
                .thenThrow(new JsonPatchException("Patch test failed"));

        String patchBody = "[{\"op\":\"test\",\"path\":\"/firstName\",\"value\":\"Pogresno\"}]";

        mockMvc.perform(patch("/api/users/1")
                        .contentType("application/json-patch+json")
                        .content(patchBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testPatchUser_WrongContentType() throws Exception {
        String patchBody = "[{\"op\":\"replace\",\"path\":\"/firstName\",\"value\":\"Ana\"}]";

        mockMvc.perform(patch("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patchBody))
                .andExpect(status().isUnsupportedMediaType());
    }


    @Test
    public void testRegister_ValidationError_MissingEmail() throws Exception {
        String invalidJson = "{\"firstName\":\"Test\",\"lastName\":\"Test\"," +
                "\"passwordHash\":\"123456\",\"role\":\"STUDENT\",\"status\":\"ACTIVE\"}";

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testRegister_ValidationError_InvalidEmail() throws Exception {
        String invalidJson = "{\"firstName\":\"Test\",\"lastName\":\"Test\"," +
                "\"email\":\"nije-email\"," +
                "\"passwordHash\":\"123456\",\"role\":\"STUDENT\",\"status\":\"ACTIVE\"}";

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testRegister_ValidationError_ShortPassword() throws Exception {
        String invalidJson = "{\"firstName\":\"Test\",\"lastName\":\"Test\"," +
                "\"email\":\"test@etf.ba\"," +
                "\"passwordHash\":\"123\",\"role\":\"STUDENT\",\"status\":\"ACTIVE\"}";

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testRegister_ValidationError_MissingFirstName() throws Exception {
        String invalidJson = "{\"lastName\":\"Test\"," +
                "\"email\":\"test@etf.ba\"," +
                "\"passwordHash\":\"123456\",\"role\":\"STUDENT\",\"status\":\"ACTIVE\"}";

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }


    @Test
    public void testGetActiveByRole_EmptyList() throws Exception {
        when(userService.getActiveUsers("NEPOSTOJI"))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/users/active?role=NEPOSTOJI"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    public void testGetAllUsers_EmptyPage() throws Exception {
        when(userService.getAllUsersPaged(anyInt(), anyInt(), anyString()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        mockMvc.perform(get("/api/users?page=0&size=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(0));
    }
}