package com.khiem.event.dto;

import java.util.Map;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
// Biểu diễn một sự kiện thông báo trong hệ thống. --> Được publish lên Kafka
public class NotificationEvent {
    String channel;
    String recipient;
    String templateCode;
    // String: username, Object: value
    Map<String, Object> param;
    String subject;
    String body;
}
