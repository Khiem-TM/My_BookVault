package com.khiem.identity.mapper;

import org.mapstruct.Mapper;

import com.khiem.identity.dto.request.PermissionRequest;
import com.khiem.identity.dto.response.PermissionResponse;
import com.khiem.identity.entity.Permission;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
