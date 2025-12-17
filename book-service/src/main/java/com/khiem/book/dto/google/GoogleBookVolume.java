package com.khiem.book.dto.google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleBookVolume {
    private String id;
    private VolumeInfo volumeInfo;
}
