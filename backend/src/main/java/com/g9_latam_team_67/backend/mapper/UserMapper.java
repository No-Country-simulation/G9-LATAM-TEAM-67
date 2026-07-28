package com.g9_latam_team_67.backend.mapper;

import com.g9_latam_team_67.backend.dto.user.UserResponse;
import com.g9_latam_team_67.backend.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );

    }
    
    public List<UserResponse> toResponseList(List<User> users) {

        return users.stream()
                .map(this::toResponse)
                .toList();

    }
}