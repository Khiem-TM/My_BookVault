package com.khiem.profile.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.khiem.profile.dto.request.ProfileCreationRequest;
import com.khiem.profile.dto.request.UpdateProfileRequest;
import com.khiem.profile.dto.response.UserProfileResponse;
import com.khiem.profile.entity.UserProfile;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserProfile toUserProfile(ProfileCreationRequest request);

    UserProfileResponse toUserProfileResponse(UserProfile entity);

    void update(@MappingTarget UserProfile entity, UpdateProfileRequest request);
}
