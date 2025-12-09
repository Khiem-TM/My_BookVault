package com.khiem.identity.mapper;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import com.khiem.identity.dto.request.ProfileCreationRequest;
import com.khiem.identity.dto.request.UserCreationRequest;

@Component
@Primary
public class ProfileMapperSpring implements ProfileMapper {
    @Override
    public ProfileCreationRequest toProfileCreationRequest(UserCreationRequest request) {
        if (request == null) return null;
        return ProfileCreationRequest.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dob(request.getDob())
                .city(request.getCity())
                .build();
    }
}
