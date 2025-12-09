package com.khiem.post.mapper;

import com.khiem.post.dto.response.PostResponse;
import com.khiem.post.entity.Post;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PostMapper {
    PostResponse toPostResponse(Post post);
}
