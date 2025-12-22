package com.khiem.profile.repository.httpclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.khiem.profile.configuration.AuthenticationRequestInterceptor;
import com.khiem.profile.dto.ApiResponse;
import com.khiem.profile.dto.response.FileResponse;

@FeignClient(
        name = "file-service",
        url = "${app.services.file}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface FileClient {
    @PostMapping(value = "/media/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<FileResponse> uploadMedia(@RequestPart("file") MultipartFile file);
}
