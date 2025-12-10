package com.khiem.identity.controller;

import java.text.ParseException;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.khiem.identity.dto.request.*;
import com.khiem.identity.dto.response.ApiResponse;
import com.khiem.identity.dto.response.AuthenticationResponse;
import com.khiem.identity.dto.response.IntrospectResponse;
import com.khiem.identity.dto.response.UserResponse;
import com.khiem.identity.exception.AppException;
import com.khiem.identity.exception.ErrorCode;
import com.khiem.identity.service.AuthenticationService;
import com.khiem.identity.service.EmailVerificationService;
import com.khiem.identity.service.UserService;
import com.nimbusds.jose.JOSEException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthenticationController {
    AuthenticationService authenticationService;
    EmailVerificationService emailVerificationService;
    UserService userService;

    @PostMapping("/register")
    ApiResponse<UserResponse> register(@RequestBody @Valid UserCreationRequest request) {
        log.info("Register user: {}", request.getUsername());
        var user = userService.createUser(request);
        return ApiResponse.<UserResponse>builder()
                .result(user)
                .message("User registered successfully")
                .build();
    }

    @PostMapping("/token")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody @Valid AuthenticationRequest request) {
        log.info("Login user: {}", request.getUsername());
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .message("Login successful")
                .build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody @Valid IntrospectRequest request) {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refreshToken(@RequestBody @Valid RefreshRequest request)
            throws ParseException, JOSEException {
        log.info("Refresh token request");
        var result = authenticationService.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .message("Token refreshed successfully")
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody @Valid LogoutRequest request) throws ParseException, JOSEException {
        log.info("Logout request");
        authenticationService.logout(request);
        return ApiResponse.<Void>builder().message("Logout successful").build();
    }

    @PostMapping("/verify-email")
    ApiResponse<String> verifyEmail(@RequestBody @Valid VerifyEmailRequest request) {
        emailVerificationService.verifyEmail(request.getToken());
        return ApiResponse.<String>builder()
                .result("Email verified successfully")
                .build();
    }

    @PostMapping("/resend-verification-email")
    ApiResponse<String> resendVerificationEmail(@RequestBody @Valid SendPasswordResetRequest request) {
        var user = authenticationService.getUserByEmail(request.getEmail());
        emailVerificationService.sendEmailVerification(user);
        return ApiResponse.<String>builder()
                .result("Verification email sent successfully")
                .build();
    }

    @PostMapping("/forgot-password")
    ApiResponse<String> forgotPassword(@RequestBody @Valid SendPasswordResetRequest request) {
        var user = authenticationService.getUserByEmail(request.getEmail());
        emailVerificationService.sendPasswordResetEmail(user);
        return ApiResponse.<String>builder()
                .result("Password reset email sent successfully")
                .build();
    }

    @PostMapping("/reset-password")
    ApiResponse<String> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORDS_NOT_MATCH);
        }

        // Validate reset token
        emailVerificationService.isValidResetToken(request.getToken());

        // Get the user from the reset token
        var resetToken = emailVerificationService.getResetToken(request.getToken());
        var user = resetToken.getUser();

        // Reset password
        userService.resetUserPassword(user.getId(), request.getPassword());
        emailVerificationService.markResetTokenAsUsed(request.getToken());

        return ApiResponse.<String>builder()
                .result("Password reset successfully")
                .build();
    }

    @GetMapping("/validate-reset-token")
    ApiResponse<Boolean> validateResetToken(@RequestParam String token) {
        boolean isValid = emailVerificationService.isValidResetToken(token);
        return ApiResponse.<Boolean>builder().result(isValid).build();
    }
}
