package com.khiem.identity.mapper;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import com.khiem.identity.dto.request.PermissionRequest;
import com.khiem.identity.dto.response.PermissionResponse;
import com.khiem.identity.entity.Permission;

@Component
@Primary
public class PermissionMapperSpring implements PermissionMapper {
    @Override
    public Permission toPermission(PermissionRequest request) {
        if (request == null) return null;
        return Permission.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }

    @Override
    public PermissionResponse toPermissionResponse(Permission permission) {
        if (permission == null) return null;
        return PermissionResponse.builder()
                .name(permission.getName())
                .description(permission.getDescription())
                .build();
    }
}
