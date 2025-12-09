package com.khiem.identity.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendPasswordResetRequest {
    @Email(message = "Email must be valid")
    @NotBlank(message = "Email cannot be blank")
    String email;
}
