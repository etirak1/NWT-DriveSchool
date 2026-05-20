package com.autoskola.trainingservice.dto;

import java.util.List;
import lombok.Data;

@Data
public class UserPageResponse {
    private List<UserDTO> content;
    private int totalElements;
    private int totalPages;
}