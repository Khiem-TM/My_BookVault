package com.khiem.identity.mapper;

import org.mapstruct.Mapper;

import com.khiem.identity.dto.request.ProfileCreationRequest;
import com.khiem.identity.dto.request.UserCreationRequest;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ProfileCreationRequest toProfileCreationRequest(UserCreationRequest request);
}
