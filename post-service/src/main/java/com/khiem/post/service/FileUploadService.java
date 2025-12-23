package com.khiem.post.service;

import com.khiem.post.dto.response.FileResponse;
import com.khiem.post.repository.httpclient.FileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileUploadService {
    FileClient fileClient;
    
    public FileResponse uploadPostImage(MultipartFile file) {
        try {
            // Validate file
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }
            
            // Check file size (limit to 10MB)
            long fileSizeInMB = file.getSize() / (1024 * 1024);
            if (fileSizeInMB > 10) {
                throw new RuntimeException("File size exceeds 10MB limit");
            }
            
            // Check file type (only images)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Only image files are allowed");
            }
            
            // Upload to file service
            return fileClient.uploadMedia(file).getResult();
        } catch (Exception e) {
            log.error("Error uploading file", e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }
}
