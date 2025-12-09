package com.khiem.identity.mapper;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import com.khiem.identity.dto.request.RoleRequest;
import com.khiem.identity.dto.response.PermissionResponse;
import com.khiem.identity.dto.response.RoleResponse;
import com.khiem.identity.entity.Permission;
import com.khiem.identity.entity.Role;

@Component
@Primary
public class RoleMapperSpring implements RoleMapper {
    @Override
    public Role toRole(RoleRequest request) {
        if (request == null) return null;
        return Role.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }

    @Override
    public RoleResponse toRoleResponse(Role role) {
        if (role == null) return null;
        Set<PermissionResponse> permissionResponses = null;
        if (role.getPermissions() != null) {
            permissionResponses = role.getPermissions().stream()
                    .map(this::toPermissionResponse)
                    .collect(Collectors.toSet());
        }
        return RoleResponse.builder()
                .name(role.getName())
                .description(role.getDescription())
                .permissions(permissionResponses)
                .build();
    }

    private PermissionResponse toPermissionResponse(Permission p) {
        if (p == null) return null;
        return PermissionResponse.builder()
                .name(p.getName())
                .description(p.getDescription())
                .build();
    }
}
