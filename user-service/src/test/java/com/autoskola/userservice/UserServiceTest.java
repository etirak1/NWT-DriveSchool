package com.autoskola.userservice;

import com.autoskola.userservice.dto.UserDTO;
import com.autoskola.userservice.model.User;
import com.autoskola.userservice.repository.UserRepository;
import com.autoskola.userservice.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private UserService userService;

    @Test
    public void testCreateUser() {
        User user = new User();
        user.setFirstName("Test");
        user.setLastName("Korisnik");

        UserDTO userDto = new UserDTO();
        userDto.setFirstName("Test");

        when(userRepository.save(any(User.class))).thenReturn(user);
        when(modelMapper.map(any(User.class), any())).thenReturn(userDto);

        UserDTO result = userService.createUser(user);

        assertEquals("Test", result.getFirstName());
    }
}
