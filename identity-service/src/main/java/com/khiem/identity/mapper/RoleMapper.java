package com.khiem.identity.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.khiem.identity.dto.request.RoleRequest;
import com.khiem.identity.dto.response.RoleResponse;
import com.khiem.identity.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
