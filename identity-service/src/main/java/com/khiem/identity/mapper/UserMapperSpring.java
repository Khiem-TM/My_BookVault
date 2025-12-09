package com.khiem.identity.mapper;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import com.khiem.identity.dto.request.UserCreationRequest;
import com.khiem.identity.dto.request.UserUpdateRequest;
import com.khiem.identity.dto.response.RoleResponse;
import com.khiem.identity.dto.response.UserResponse;
import com.khiem.identity.entity.Role;
import com.khiem.identity.entity.User;

@Component
@Primary
public class UserMapperSpring implements UserMapper {
    @Override
    public User toUser(UserCreationRequest request) {
        if (request == null) return null;
        return User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .emailVerified(false)
                .build();
    }

    @Override
    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        Set<RoleResponse> roleResponses = null;
        if (user.getRoles() != null) {
            roleResponses = user.getRoles().stream().map(this::toRoleResponse).collect(Collectors.toSet());
        }
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .emailVerified(user.isEmailVerified())
                .roles(roleResponses)
                .build();
    }

    @Override
    public void updateUser(User user, UserUpdateRequest request) {
        // roles ignored per spec; service handles password encoding and roles assignment
        // no direct field changes needed here besides those managed in service
    }

    private RoleResponse toRoleResponse(Role r) {
        if (r == null) return null;
        return RoleResponse.builder()
                .name(r.getName())
                .description(r.getDescription())
                .build();
    }
}
